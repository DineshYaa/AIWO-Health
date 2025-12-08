import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const changeDateFormate = (date: string): string => {
  let [year, month, day] = date?.split("-");
  if (month?.length < 2) {
    month = "0" + month;
  }
  if (day?.length < 2) {
    day = "0" + day;
  }
  return `${day}-${month}-${year}`;
};

export const convertTo12Hour = (time24: string): string => {
  if (!time24) return "";
  if (time24 === "00:00") return "12:00 AM";
  if (time24 === "24:00") return "12:00 PM";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12.toString().padStart(2, "0")}:${
    minutes.length < 2 ? "0" + minutes : minutes
  } ${ampm}`;
};
