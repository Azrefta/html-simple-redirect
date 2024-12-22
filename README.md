# HTML Simple Redirect  

This repository contains a simple HTML file designed to automatically redirect users to a specified URL when the file is accessed via a browser. This project demonstrates a minimalist approach to creating an automatic redirect using pure HTML and JavaScript.

[☕ Buy Me a Coffee : ](https://trakteer.id/azrefta/tip)
https://trakteer.id/azrefta/tip

## Features

- **Lightweight and Fast**: The HTML file is minimal, ensuring quick load times.
- **Customizable**: Easily modify the URL to redirect users to any destination.
- **Cross-Browser Compatibility**: Works on all modern web browsers.

## How It Works

The HTML file uses a simple `<script>` tag to execute JavaScript code that redirects users to the specified URL (`https://whatsapp.com/channel/0029VavzRTb5kg75dNpzjP02`). When the HTML file is opened in any browser, the redirection happens automatically without requiring user interaction.

## File Contents

### `index.html`

```html<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <script>
        // Redirect to the specified URL
        window.location.href = "https://whatsapp.com/channel/0029VavzRTb5kg75dNpzjP02";
    </script>
</head>
<body>
    <p>Redirecting to url...</p>
</body>
</html>
```

## Getting Started

### Clone the Repository

To get started with this project, clone the repository to your local machine:

1. Open your terminal or command prompt.
2. Run the following command:

   ```bash
   git clone https://github.com/Azrefta/html-simple-redirect.git
   ```

3. Navigate to the project directory:

   ```bash
   cd html-simple-redirect
   ```

4. Open the `index.html` file in your browser to test the redirection.

## Customize the Redirect URL

If you'd like to redirect to a different URL, simply open `index.html` in a text editor and replace the URL in the following line:

```javascript
window.location.href = "https://your-new-url.com";
```

Save the file, and you're ready to go!

## License

This project is licensed under the MIT License. See the [LICENSE](https://raw.githubusercontent.com/Azrefta/html-simple-redirect/refs/heads/main/LICENSE) file for more details.
