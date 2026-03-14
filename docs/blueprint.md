# **App Name**: NEU MOA Hub

## Core Features:

- NEU Google Auth & Profile Management: Secure Google Sign-In with strict `@neu.edu.ph` email domain validation. Upon first login, create or update a user profile in Firestore including uid, email, fullName, default role, and 'isBlocked' status. Handle blocked users by denying access with a toast notification.
- Role-Based Access & Navigation: Dynamically routes authenticated users to specific dashboards ('/admin', '/faculty', '/student') based on their assigned role in their Firestore user profile, ensuring tailored content access.
- MOA List & Overview: Displays a personalized list of Memorandums of Agreement (MOAs) relevant to the logged-in user's role, with essential summary information and filtering options.
- MOA Detail View: Provides a dedicated view for each MOA, showing comprehensive details, attached documents, and related information relevant to its status and participants.
- User Role & Block Status Management: An administrative interface allowing 'admin' users to view all registered users, modify their roles (student, faculty, admin), and change their 'isBlocked' status in Firestore.
- AI MOA Key Clause Identifier Tool: A generative AI tool for 'admin' and 'faculty' users to input MOA document text and receive AI-identified key clauses, actionable items, or obligations.
- Authentication State Observer: Utilizes Firebase `onAuthStateChanged` to monitor user authentication status, performing a single `getDoc` call to fetch user profile data from Firestore upon login and managing the app's loading state.

## Style Guidelines:

- Primary color: A deep, professional blue (#223AD9) evoking institutional trust and clarity.
- Background color: A very light, desaturated blue (#F2F5FC) to maintain professionalism while ensuring readability.
- Accent color: A vibrant, clear cyan-blue (#1EBDE5) to highlight interactive elements and provide visual dynamism.
- Headline and body font: 'Inter' (sans-serif) for its modern, objective, and highly legible characteristics, suitable for an administrative and informational application.
- Implement a clean, modern icon set, utilizing SVG for scalable display. Icons should be clear and directly representative of actions or categories, such as documents, user roles (e.g., student, faculty, admin), and administrative functions.
- Employ a responsive design approach ensuring optimal viewing across desktop, tablet, and mobile devices. Key information such as MOA lists and details will feature a clear, structured dashboard-like layout for efficient monitoring.
- Incorporate subtle and smooth transitions for page navigation, data loading, and modal interactions to enhance the user experience without distraction. Use tasteful hover effects for interactive components like buttons and list items.