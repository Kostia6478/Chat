package main

type Message struct {
	Type     string   `json:"type"`
	Msg      string   `json:"msg"`
	Username string   `json:"username,omitempty"`
	Time     int64    `json:"time,omitempty"`
	Users    []string `json:"users,omitempty"`
}
