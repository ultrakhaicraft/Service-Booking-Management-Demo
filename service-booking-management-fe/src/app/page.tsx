import Image from "next/image";
import styles from "./page.module.css";

{/* Homepage for guest, entry point of the website */}
{/* Show title as "Service Booking System", and a single button that point to login page at /login */}

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Service Booking System</h1>
        <a href="/login" className={styles.button}>
          Login
        </a>
      </main>
    </div>
  );
}
