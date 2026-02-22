package main

import (
	"encoding/json"
	"fmt"
)

type PrivateMessage struct {
	to   string
	data []byte
}

type Hub struct {
	clients       map[*Client]bool
	clientsByName map[string]*Client
	statusOnline  map[string]bool
	broadcast     chan []byte
	private       chan PrivateMessage
	register      chan *Client
	unregister    chan *Client
	history       [][]byte
	maxHistory    int
}

func newHub() *Hub {
	return &Hub{
		clients:       make(map[*Client]bool),
		clientsByName: make(map[string]*Client),
		statusOnline:  make(map[string]bool),
		broadcast:     make(chan []byte),
		private:       make(chan PrivateMessage),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		history:       make([][]byte, 0),
		maxHistory:    50,
	}
}

func (h *Hub) getUsernames() []string {
	users := make([]string, 0, len(h.clients))
	for c := range h.clients {
		users = append(users, c.username)
	}
	return users
}

func (h *Hub) broadcastUserList() {
	msg := Message{
		Type:  "userslist",
		Users: h.getUsernames(),
	}
	data, _ := json.Marshal(msg)
	for c := range h.clients {
		c.send <- data
	}
}
func (h *Hub) broadcastPresence(username string, online bool) {
	fmt.Println("Broadcast presence:", username, online)
	data, _ := json.Marshal(map[string]interface{}{
		"type":     "presence",
		"username": username,
		"online":   online,
	})

	for c := range h.clients {
		c.send <- data
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.clientsByName[client.username] = client
			h.statusOnline[client.username] = true
			h.broadcastUserList()
			h.broadcastPresence(client.username, true)

			for username, online := range h.statusOnline {
				data, _ := json.Marshal(map[string]interface{}{
					"type":     "presence",
					"username": username,
					"online":   online,
				})
				client.send <- data
			}

			for _, msg := range h.history {
				client.send <- msg
			}

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				delete(h.clientsByName, client.username)
				h.statusOnline[client.username] = false
				close(client.send)
				h.broadcastUserList()
				h.broadcastPresence(client.username, false)
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

		case pm := <-h.private:
			if c, ok := h.clientsByName[pm.to]; ok {
				c.send <- pm.data
			}
		}
	}
}
