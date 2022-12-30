function fileChanged(pdf) {
  let fileName = document.querySelector('.fileName');
  fileName.textContent = pdf.files[0]['name'];
}