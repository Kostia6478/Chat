package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func serveWS(hub *Hub, w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		username = "Anonymous"
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	client := &Client{
		conn:     conn,
		send:     make(chan []byte, 256),
		username: username,
	}

	hub.register <- client

	joinMessage := Message{
		Type: "system",
		Msg:  username + " has joined the chat.",
	}

	data, _ := json.Marshal(joinMessage)
	hub.broadcast <- data

	go client.readPump(hub)
	go client.writePump()
}
