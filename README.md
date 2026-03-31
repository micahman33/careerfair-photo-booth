# Imagine 2025 Action Figure Generator

A mobile-first web application that allows users to create custom action figures based on their photos and chosen accessories. Built for Automation Anywhere's Imagine 2025 conference.

## Features

- Take 3 selfies using your device's camera
- Input 3 custom accessories for your action figure
- Generate a unique action figure using OpenAI's DALL-E 3
- Mobile-first design with responsive layout
- Branded with Automation Anywhere's Imagine 2025 theme

## Setup

1. Clone this repository
2. Replace `OPENAI_API_KEY` in `script.js` with your actual OpenAI API key
3. Add the Imagine 2025 logo as `imagine-logo.png` in the root directory
4. Open `index.html` in a web browser

## Requirements

- Modern web browser with camera access
- OpenAI API key
- Internet connection

## Usage

1. Allow camera access when prompted
2. Take 3 photos of yourself from different angles
3. Enter 3 accessories you want your action figure to have
4. Click "Generate My Action Figure" to create your custom action figure
5. Wait for the image to generate (this may take a few moments)
6. View and download your generated action figure

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses the OpenAI DALL-E 3 API for image generation
- Mobile-first responsive design
- Follows Automation Anywhere's brand guidelines

## Security Note

The application requires an OpenAI API key to function. Make sure to:
- Never commit your API key to version control
- Use environment variables or a secure configuration method in production
- Implement proper API key rotation and security measures

## License

© 2025 Automation Anywhere. All rights reserved. 