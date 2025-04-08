# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e55484c1-8897-447e-adf9-c06d2f9ee0f3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e55484c1-8897-447e-adf9-c06d2f9ee0f3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

### Lovable Deployment

Simply open [Lovable](https://lovable.dev/projects/e55484c1-8897-447e-adf9-c06d2f9ee0f3) and click on Share -> Publish.

### Railway Deployment

For deploying the microservices architecture to Railway:

1. Make sure you have the [Railway CLI](https://docs.railway.app/develop/cli) installed:
   ```
   npm i -g @railway/cli
   ```

2. Run our setup script to configure the Railway project:
   ```
   chmod +x scripts/setup-railway.sh
   ./scripts/setup-railway.sh
   ```

3. The script will guide you through:
   - Setting up a new Railway project
   - Adding a Redis service
   - Configuring environment variables
   - Deploying the application

For detailed instructions, see the [Railway Deployment Guide](docs/railway-deployment.md).

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
