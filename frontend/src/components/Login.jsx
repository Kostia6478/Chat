function Login({ setUsername }) {
  return (
    <div className="container mt-5">
      <div className="card p-3 shadow-sm">
        <h4>Enter username</h4>
        <input
          className="form-control mt-2"
          placeholder="Username"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              setUsername(e.target.value.trim());
            }
          }}
        />
      </div>
    </div>
  );
}

export default Login;