"use client";
import { ToastContainer } from "react-toastify";
// Removed the CSS import from here – it's now handled globally

export default function ToastProvider() {
  return <ToastContainer position="top-right" autoClose={3000} />;
}