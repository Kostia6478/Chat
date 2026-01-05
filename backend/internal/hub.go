package main

import "encoding/json"

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	history    [][]byte
	maxHistory int
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		history:    make([][]byte, 0),
		maxHistory: 50,
	}
}

func (h *Hub) getUsernames() []string {
	users := make([]string, 0, len(h.clients))
	for client := range h.clients {
		users = append(users, client.username)
	}
	return users
}

func (h *Hub) broadcastUserList() {
	msg := Message{
		Type:  "userslist",
		Users: h.getUsernames(),
	}
	data, _ := json.Marshal(msg)

	for client := range h.clients {
		client.send <- data
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.broadcastUserList()
			for _, msg := range h.history {
				client.send <- msg
			}
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.broadcastUserList()
			}

		case msg := <-h.broadcast:
			h.history = append(h.history, msg)
			if len(h.history) > h.maxHistory {
				h.history = h.history[1:]
			}
			for client := range h.clients {
				select {
				case client.send <- msg:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
