#!/usr/bin/env python3
"""
Simple HTTP server for VeXachat development
"""
import http.server
import socketserver
import os
import webbrowser

PORT = 8000
DIRECTORY = "public"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    if not os.path.exists(DIRECTORY):
        print(f"Error: {DIRECTORY} directory not found!")
        return
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n🚀 VeXachat Development Server")
        print(f"👉 http://localhost:{PORT}")
        print(f"📁 Serving from: {os.path.abspath(DIRECTORY)}")
        print("\nPress Ctrl+C to stop\n")
        
        # Open browser automatically
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")
            httpd.server_close()

if __name__ == "__main__":
    main()
