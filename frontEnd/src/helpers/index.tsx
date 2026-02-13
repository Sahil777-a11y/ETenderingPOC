import dayjs from "dayjs";

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US");
}

export const formatDateTime = (
  dateString: string,
  timeZone?: string
): string => {
  if (!dateString) return "";

  const utcDate = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");

  const localTimeZone =
    timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return utcDate.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: localTimeZone,
  });
};

export const formatTime = (dateString: string, timeZone?: string): string => {
  if (!dateString) return "";
  const utcDate = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");
  const localTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  return utcDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: localTimeZone,
  });
}

export const formatDateOrToday = (isoString: string): string => {
  const date = dayjs(isoString);
  return date.isSame(dayjs(), "day")
    ? "Today"
    : date.format("D MMMM, YYYY");
};

