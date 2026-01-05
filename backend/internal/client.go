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
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		text := string(message)
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
