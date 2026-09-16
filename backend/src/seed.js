require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); const Artisan = require('./models/Artisan'); const Category = require('./models/Category'); const Product = require('./models/Product');
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
const catalog = [
  ['Sambalpuri Handwoven Saree', 'Textiles', 'Sambalpuri Sarees', 'Sambalpuri handloom cotton saree with traditional ikat-inspired bandha motifs, woven in rich red and black.', 'cotton', 2850, 'Sambalpuri', 'Odisha', 'photo-1610030469983-98e550d6193c'],
  ['Khandua Silk Saree with Geometric Border', 'Textiles', 'Handwoven Sarees', 'Handwoven Khandua silk saree featuring a crisp traditional border and a luminous festive drape.', 'silk', 6800, 'Handwoven Silk', 'Odisha', 'photo-1610030469983-98e550d6193c'],
  ['Ikat Handloom Saree in Indigo', 'Textiles', 'Ikat Sarees', 'A breathable cotton ikat saree with resist-dyed chevrons, made slowly on a pit loom.', 'cotton', 3200, 'Ikat', 'Telangana', 'photo-1594736797933-d0501ba2fe65'],
  ['Pattachitra Krishna Painting', 'Painting', 'Pattachitra Art', 'Traditional Odisha Pattachitra artwork of Krishna, painted with natural pigments on prepared cloth.', 'natural pigments on cloth', 4200, 'Pattachitra', 'Odisha', 'photo-1549490349-8643362247b5'],
  ['Pattachitra Tree of Life Panel', 'Painting', 'Traditional Paintings', 'Detailed tree of life composition with floral borders in the distinctive Pattachitra line style.', 'cloth and natural colours', 3600, 'Pattachitra', 'Odisha', 'photo-1549490349-8643362247b5'],
  ['Dokra Brass Horse', 'Metal Craft', 'Dokra Art', 'A sculptural lost-wax Dokra brass horse with hand-textured mane and a warm antique finish.', 'brass', 2400, 'Dokra', 'West Bengal', 'photo-1577083288073-40892c0860a4'],
  ['Dokra Tribal Musician Figurine', 'Metal Craft', 'Dokra Art', 'Hand-cast brass figurine celebrating a tribal musician, a small collectible with an expressive silhouette.', 'brass', 1750, 'Dokra', 'Chhattisgarh', 'photo-1565193566173-7a0ee3dbe261'],
  ['Terracotta Warli Wall Plate', 'Pottery', 'Terracotta Products', 'Hand-shaped terracotta wall plate decorated with a monochrome Warli-inspired village scene.', 'terracotta', 980, 'Terracotta', 'West Bengal', 'photo-1610701596007-11502861dcfa'],
  ['Hand-thrown Blue Pottery Vase', 'Pottery', 'Pottery', 'Wheel-thrown vase with a cobalt floral glaze, finished by a Jaipur studio potter.', 'stoneware', 1650, 'Blue Pottery', 'Rajasthan', 'photo-1578749556568-bc2c40e68b61'],
  ['Bamboo Lidded Storage Basket', 'Bamboo Craft', 'Baskets', 'Lightweight woven bamboo basket with a fitted lid for storing linens, toys or keepsakes.', 'bamboo', 760, 'Bamboo Weaving', 'Assam', 'photo-1528698827591-e19ccd7bc23d'],
  ['Bamboo Tea Tray with Cane Detail', 'Bamboo Craft', 'Bamboo Crafts', 'Low-profile bamboo tea tray edged with cane for relaxed everyday serving.', 'bamboo and cane', 1250, 'Bamboo Craft', 'Tripura', 'photo-1544816155-12df9643f363'],
  ['Cane Lounge Basket Chair', 'Home Decor', 'Cane Crafts', 'A supportive cane chair woven by hand for reading corners and slow afternoons.', 'cane', 5400, 'Cane Weaving', 'Kerala', 'photo-1598300042247-d088f8ab3a91'],
  ['Carved Sheesham Elephant Pair', 'Woodcraft', 'Wooden Handicrafts', 'Pair of hand-carved sheesham elephants with a satin oil finish and finely incised details.', 'sheesham wood', 2200, 'Wood Carving', 'Rajasthan', 'photo-1544967082-d9d25d867d66'],
  ['Kashmiri Walnut Serving Bowl', 'Woodcraft', 'Wooden Handicrafts', 'Deep walnut bowl with gentle floral carving, shaped and finished in a Srinagar workshop.', 'walnut wood', 3100, 'Walnut Carving', 'Jammu and Kashmir', 'photo-1601058268499-e52658b8bb88'],
  ['Hand-carved Soapstone Ganesha', 'Handicrafts', 'Stone Carving', 'Small soapstone Ganesha carved with a calm expression and polished by hand.', 'soapstone', 1450, 'Stone Carving', 'Odisha', 'photo-1602523961358-f9f03dd557db'],
  ['Brass Lotus Diya Set', 'Metal Craft', 'Brass Products', 'Set of three cast brass diyas with lotus petals, designed for festive evenings and daily puja.', 'brass', 1350, 'Brass Casting', 'Uttar Pradesh', 'photo-1603006905003-be475563bc59'],
  ['Hammered Copper Water Bottle', 'Metal Craft', 'Copper Products', 'Food-safe hammered copper bottle made by a traditional Moradabad metalworker.', 'copper', 1150, 'Copperware', 'Uttar Pradesh', 'photo-1602143407151-7111542de6e8'],
  ['Kutch Mirrorwork Jewellery Box', 'Home Decor', 'Home Decor', 'Compact wooden jewellery box wrapped in colourful Kutch embroidery and mirrorwork.', 'wood and cotton', 1850, 'Mirrorwork', 'Gujarat', 'photo-1582738411706-bfc8e691d1c2'],
  ['Dhokra Brass Leaf Earrings', 'Jewellery', 'Tribal Jewellery', 'Lightweight statement earrings cast in the Dokra tradition with an organic leaf form.', 'brass', 890, 'Tribal Jewellery', 'Chhattisgarh', 'photo-1535632066927-ab7c9ab60908'],
  ['Beaded Terracotta Necklace', 'Jewellery', 'Handmade Jewellery', 'Hand-painted terracotta beads strung with cotton cord for an earthy everyday accent.', 'terracotta and cotton', 640, 'Terracotta Jewellery', 'West Bengal', 'photo-1515562141207-7a88fb7ce338'],
  ['Kantha Embroidered Tote', 'Textiles', 'Embroidery', 'Reusable cotton tote with colourful running-stitch Kantha embroidery by a women-led collective.', 'recycled cotton', 980, 'Kantha Embroidery', 'West Bengal', 'photo-1544816155-12df9643f363'],
  ['Jute Market Shopper', 'Handicrafts', 'Jute Products', 'Strong natural jute shopper with leather-look handles and a hand-stitched inner pocket.', 'jute', 720, 'Jute Craft', 'West Bengal', 'photo-1553062407-98eeb64c6a62'],
  ['Palm Leaf Weave Wall Basket', 'Home Decor', 'Palm Leaf Crafts', 'Decorative palm-leaf basket with a sunburst weave for textured wall styling.', 'palm leaf', 1150, 'Palm Leaf Weaving', 'Odisha', 'photo-1558618666-fcd25c85cd64'],
  ['Hand-painted Kathputli Puppet', 'Handicrafts', 'Traditional Masks', 'Colourful Rajasthani kathputli puppet with a hand-painted face and textile costume.', 'wood and textile', 1250, 'Folk Puppet', 'Rajasthan', 'photo-1518005020951-eccb494ad742'],
  ['Madhubani Fish Wall Art', 'Painting', 'Wall Art', 'A vibrant Madhubani fish composition painted with fine lines and botanical motifs.', 'handmade paper and natural colours', 2100, 'Madhubani', 'Bihar', 'photo-1549490349-8643362247b5'],
  ['Wooden Pull-along Elephant', 'Woodcraft', 'Wooden Toys', 'Smoothly sanded wooden pull-along elephant finished with child-safe natural wax.', 'mango wood', 850, 'Wooden Toy', 'Karnataka', 'photo-1596461404969-9ae70f2830c1'],
  ['Handwoven Cotton Table Runner', 'Textiles', 'Handwoven Textiles', 'Striped handwoven cotton runner that brings a subtle loom texture to the dining table.', 'cotton', 780, 'Handloom Weaving', 'Maharashtra', 'photo-1604014237800-1c9102c219da'],
  ['Rattan Pendant Lamp', 'Home Decor', 'Handmade Lamps', 'Airy rattan pendant lamp that casts a warm woven shadow over dining and reading spaces.', 'rattan', 3200, 'Rattan Weaving', 'Kerala', 'photo-1524484485831-a92ffc0de03f'],
  ['Craft Gift Hamper of Indian Miniatures', 'Handicrafts', 'Craft Gift Items', 'Curated gift box with a brass diya, block-printed notebook and miniature folk painting.', 'brass, paper and cotton', 2600, 'Craft Gift Set', 'New Delhi', 'photo-1512909006721-3d6018887383']
];
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Artisan.deleteMany({});
  await Promise.all([User.deleteMany({ email: /@demo\.karigarconnect\.local$/ }), Category.deleteMany({})]);
  const categoryNames = [...new Set(catalog.map((item) => item[1]))];
  const categoryDocs = await Category.insertMany(categoryNames.map((name) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })));
  const password = 'Demo@12345';
  const [artisan, buyer, admin] = await User.create([{ name: 'Ramesh Kumar', email: 'artisan@demo.karigarconnect.local', password, role: 'artisan', craftType: 'Indian Handicrafts', location: { state: 'Odisha', country: 'India' }, verified: true }, { name: 'Demo Buyer', email: 'buyer@demo.karigarconnect.local', password, role: 'buyer' }, { name: 'Platform Admin', email: 'admin@demo.karigarconnect.local', password, role: 'admin' }]);
  await Artisan.create({ userId: artisan._id, craftType: 'Indian Handicrafts', experience: 12, workshopName: 'Karigar Collective Studio', rating: 4.8 });
  await Product.create(catalog.map(([title, category, subcategory, description, material, price, craftType, state, imageId], index) => ({ artisanId: artisan._id, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), description, categoryId: categoryDocs.find((c) => c.name === category)._id, subcategory, craftType, material, price, discountPercent: [10, 15, 20, 25, 30][index % 5], thumbnail: image(imageId), images: [{ url: image(imageId) }], stock: 8 + index, status: 'published', tags: [category.toLowerCase(), subcategory.toLowerCase(), craftType.toLowerCase(), material.toLowerCase(), 'handmade', state.toLowerCase()], location: { state }, rating: Number((4.1 + ((index * 37) % 90) / 100).toFixed(2)), reviewCount: 12 + index * 3, featured: index < 8, handmade: true })));
  console.log(`Seed complete: ${catalog.length} products. Demo passwords: Demo@12345`); await mongoose.disconnect();
}
seed().catch((error) => { console.error(error); process.exit(1); });
