# 📸 Smart Photo Organizer - Frontend

An AI-powered web application built with **Next.js 14 (App Router)** that automatically categorizes and organizes photos using a custom-trained TensorFlow.js model.

## 🌟 Key Features
* **AI Auto-Categorization:** Real-time client-side image classification (Indoor vs. Outdoor).
* **Dynamic Gallery:** Automatic folder-like organization based on AI labels.
* **Secure Authentication:** Integrated with a Node.js/MongoDB backend via JWT.
* **Responsive UI:** Mobile-first design using Tailwind CSS and Lucide Icons.

## 🛠️ Tech Stack
* **Frontend:** Next.js 14, React, Tailwind CSS
* **AI/ML:** TensorFlow.js
* **API Client:** Axios
* **State Management:** React Context API

## ⚙️ Setup Instructions

1.  **Clone the Repo:**
    ```bash
    git clone [https://github.com/Abdul-Rahim13/smart-photo-organizer-frontend.git](https://github.com/Abdul-Rahim13/smart-photo-organizer-frontend.git)
    cd smart-photo-organizer-frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root:
    ```env
    NEXT_PUBLIC_API_URL=[https://smart-photo-organizer-backend-production.up.railway.app](https://smart-photo-organizer-backend-production.up.railway.app)
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 📁 Folder Structure
```text
src/
 ├── app/             # App Router (Pages: Login, Signup, Gallery)
 ├── components/      # Reusable UI (Navbar, ImageCard, UploadModal)
 ├── context/         # AuthContext (Login/Logout Logic)
 ├── lib/             # Axios instance & AI helper functions
public/
 └── model/           # Custom TF.js model files (.json, .bin)
