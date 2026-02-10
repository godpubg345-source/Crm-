# How to Run BWBS Education CRM on a New Computer

## Prerequisites
*   **Python 3.10+**
*   **Node.js 18+**
*   **Git**

## 1. Clone & Setup Backend

1.  **Clone the repository:**
    ```powershell
    git clone <your-repo-url>
    cd lbwbs-education
    ```

2.  **Create Virtual Environment:**
    ```powershell
    python -m venv venv
    .\venv\Scripts\Activate
    ```

3.  **Install Dependencies:**
    ```powershell
    pip install -r requirements.txt
    ```

4.  **Configure Environment:**
    *   Copy `.env.example` to `.env`.
    *   Open `.env` and set `SECRET_KEY` (you can generate one or just use a random string).

5.  **Initialize Database:**
    *   Since the database is not shared (for security), you start with a clean slate.
    ```powershell
    python manage.py migrate
    python manage.py createsuperuser
    ```
    *   Follow the prompts to create your admin account.

6.  **Run Backend Server:**
    ```powershell
    python manage.py runserver
    ```

## 2. Setup Frontend

1.  **Navigate to frontend folder:**
    ```powershell
    cd bwbs-crm-frontend
    ```

2.  **Install Dependencies:**
    ```powershell
    npm install
    ```

3.  **Run Frontend Server:**
    ```powershell
    npm run dev
    ```

## 3. Access the App
*   **Frontend:** http://localhost:5173
*   **Backend Admin:** http://localhost:8000/admin
*   **API:** http://localhost:8000/api/v1

## Note on Data
Your database (`db.sqlite3`) is correctly **ignored** by Git to prevent sensitive data leaks.
On a new computer, the system will be **empty**. You will need to log in as the superuser you created and start adding Branches, Users, and Leads manually.
