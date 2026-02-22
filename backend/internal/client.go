package main

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn     *websocket.Conn
	send     chan []byte
	username string
}

func (c *Client) readPump(hub *Hub) {
	defer func() {
		leave := Message{
			Type: "system",
			Msg:  c.username + " has left the chat.",
			Time: time.Now().Unix(),
		}

		data, _ := json.Marshal(leave)

		hub.broadcast <- data

		hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, raw, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var incoming Message
		if err := json.Unmarshal(raw, &incoming); err == nil {
			// typing
			if incoming.Type == "typing" {
				if target, ok := hub.clientsByName[incoming.To]; ok {
					data, _ := json.Marshal(Message{
						Type:     "typing",
						Username: c.username,
						To:       incoming.To,
					})
					target.send <- data
				}
				continue
			}

			// private message
			if incoming.Type == "private" {
				incoming.Username = c.username
				incoming.Time = time.Now().Unix()
				data, _ := json.Marshal(incoming)
				hub.private <- PrivateMessage{
					to:   incoming.To,
					data: data,
				}
				c.send <- data
				continue
			}
		}

		// global message
		text := string(raw)
		if len(text) == 0 || len(text) > 500 {
			continue
		}
		out := Message{
			Type:     "message",
			Username: c.username,
			Msg:      text,
			Time:     time.Now().Unix(),
		}
		data, _ := json.Marshal(out)
		hub.broadcast <- data
	}
}
func (c *Client) writePump() {
	defer c.conn.Close()
	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			break
		}
	}
}
