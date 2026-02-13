export const downloadFile = (batchName: string, response: any) => {
  const url = window.URL.createObjectURL(response);
  const a = document.createElement("a");
  a.href = url;
  a.download = batchName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
