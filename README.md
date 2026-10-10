# FamMap

FamMap is an interactive family-tree application for managing family profiles, visualizing relationships, and organizing family data on a canvas.

## Features

- Supabase Auth login.
- Interactive family tree canvas powered by React Flow.
- Parent, child, partner, and marriage relationships.
- Indonesian kinship title calculation.
- Add, edit, delete, and search family profiles.
- Multi-select profiles with Shift or Ctrl/Cmd.
- Grid mode for aligning profiles.
- Automatic profile position persistence in Supabase.
- Responsive interface with Claymorphism, Glassmorphism, Liquid Glass, Neumorphism, and Skeuomorphism styles.
- Independent light and dark appearance modes.

## Tech Stack

- Next.js 16 with App Router
- React 19 and TypeScript
- Supabase Auth and PostgreSQL
- React Flow
- Tailwind CSS
- Framer Motion and Lucide React

## Setup

Node.js 20 or newer is required.

1. Clone the repository and open the project directory.

```bash
git clone <repository-url> fammap-dumci
cd fammap-dumci
npm install
```

2. Create a Supabase project and run [`supabase_init.sql`](./supabase_init.sql) in the Supabase SQL Editor.

3. Enable the Email provider in Supabase Auth and create a user account.

4. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side. Never expose or commit it.

## Run the Project

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Supabase account.

Validate a production build:

```bash
npm run lint
npm run build
npm start
```

## Canvas Usage

- Click a profile to open its details.
- Hold Shift and click profiles to select multiple profiles.
- Drag one selected profile to move the entire selection.
- Enable `Grid Mode` to snap profile movement to the grid.
- Profile positions are saved automatically after movement.

## Appearance

- A style is selected at random when FamMap opens in a new browser tab.
- Choose another style from the `Gaya` dropdown to use it for the current tab session. The selection is not saved after the tab is closed.
- Use the sun/moon button to switch between light and dark mode. The mode is independent of the selected style and is saved in the browser.
- The selected appearance applies to the family tree, profile dialogs, and login screen.

## Data Structure

- `persons`: profile data and parent relationships.
- `marriages`: partner relationships and marriage status.
- `person_positions`: saved profile coordinates on the canvas.

Available API routes:

- `/api/persons`
- `/api/persons/[id]`
- `/api/marriages`
- `/api/person-positions`

## Project Structure

```text
app/          Pages, layout, and API routes
components/   Canvas, node, modal, and input components
lib/          Supabase clients and rate limiter
types/        Family data types
utils/        Tree layout, kinship calculation, and appearance settings
styles/       Five selectable visual styles with light and dark variants
```

## License

No license file is included yet. Add a license before presenting the repository as open source or granting reuse rights; making a repository public by itself does not specify a license.
