import sharp from 'sharp';

const images = [
  '001','002','003','004','005','006','007','008','009','010',
  '011','012','013','014','015','016','017','018','019','020'
];

for (const name of images) {
  await sharp(`img/${name}.png`)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(`img/${name}.webp`);

  console.log(`img/${name}.png -> img/${name}.webp`);
}

console.log('Готово. Теперь замени ссылки .png на .webp в index.html и app.js.');
