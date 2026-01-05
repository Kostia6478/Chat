package main

import (
	"log"
	"net/http"
)

func main() {
	hub := newHub()

	go hub.run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWS(hub, w, r)
	})

	log.Println("Serve started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
