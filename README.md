# ChronoCanvas App Manual

Welcome to ChronoCanvas, your personal digital journal designed for reflection and organization. This manual will guide you through using the app's features.

## Environment Setup

Before using ChronoCanvas, you need to configure your environment variables:

1. Copy the example environment file:
   ```bash
   copy .env.example .env.local
   ```

2. Update the `.env.local` file with your actual values:


### Firebase Configuration

To set up Firebase:
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Project Settings > General > Your apps
4. Add a web app and copy the configuration values
5. Update these variables in your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note:** Never commit your `.env.local` file to version control. It contains sensitive information.

## Development

### Installing Dependencies

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### Building for Production

```bash
npm run build
npm run start
```

## Getting Started

To begin using ChronoCanvas, you will need to sign in using your Google account.

1.  Open the ChronoCanvas application.
2.  Click on the "Sign in with Google" button.
3.  Follow the prompts to authenticate with your Google account.

Once successfully authenticated, you will be directed to your journal dashboard.

## Managing Journal Entries

ChronoCanvas allows you to easily create, edit, and delete your journal entries.

### Creating a New Entry

1.  On the journal dashboard, locate and click the button or icon to create a new entry (this is typically a prominent '+' or "New Entry" button).
2.  A new entry editor will open.
3.  Type your journal entry content into the provided text area.
4.  Use the formatting and coloring options described in the following sections to customize your entry.
5.  To save your entry, look for a "Save" or "Done" button and click it.

### Editing an Existing Entry

1.  On the journal dashboard, find the entry you wish to edit. Entries are typically displayed as cards.
2.  Click on the entry card. This will open the entry in the editor.
3.  Make the desired changes to the text or formatting.
4.  Click the "Save" or "Done" button to update the entry.

### Deleting an Entry

1.  On the journal dashboard, locate the entry you want to delete.
2.  Look for a delete icon (often a trash can) associated with the entry card.
3.  Click the delete icon.
4.  You may be prompted to confirm your decision to delete the entry. Confirm to proceed.

## Text Formatting

ChronoCanvas provides basic text formatting options to enhance your entries.

When the entry editor is open, you will see a toolbar with formatting options:

-   **Bold:** Select the text you want to make bold and click the bold icon (often a 'B').
-   **Italics:** Select the text you want to italicize and click the italics icon (often an 'I').
-   **Underline:** Select the text you want to underline and click the underline icon (often a 'U').

You can combine these formatting options on the same text.

## Coloring Entries and Text

ChronoCanvas offers options to color-code your entries and apply color to your text for visual organization and style.

### Color-Coding Entries

1.  When creating or editing an entry, look for an option to assign a color to the entry. This might be a color palette selector.
2.  Click on the desired color from the provided palette.
3.  This color will be applied to the entry card on the dashboard, helping you categorize or visually distinguish your entries.

### Coloring Text within Entries

1.  In the entry editor, select the text you wish to color.
2.  Look for a text coloring tool, often represented by an 'A' with a color swatch or a palette icon.
3.  Click on the text coloring tool to reveal a palette of 10 UI-matching colors.
4.  Click on the desired color from the palette to apply it to the selected text.

## Google Authentication

ChronoCanvas uses Google Authentication to provide a secure and convenient way to access your journal. Your journal data is linked to your Google account, ensuring privacy and allowing you to access your entries across devices where you sign in with the same account.

Simply follow the steps in the "Getting Started" section to sign in securely using your Google credentials.
