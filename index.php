<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistem Pembukuan</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-body">
    
    <div class="login-container">
        <form id="loginForm">
            <h2>Login Admin</h2>
            <div class="input-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
            <p id="login-error" class="error-message"></p>
        </form>
    </div>

    <script src="assets/js/main.js"></script>
</body>
</html>