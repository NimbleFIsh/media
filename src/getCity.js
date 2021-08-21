export default async function getCity(data) {
    const d = await fetch(`https://api.geotree.ru/address.php?lat=${data.coords.latitude}&lon=${data.coords.longitude}&limit=1`);
    const res = await d.json();
    return res[0].place_name;
}