import "dotenv/config";
import { db } from "./index";
import {
  users,
  categories,
  products,
  reviews,
  blogPosts,
  coupons,
} from "./schema";
import bcrypt from "bcryptjs";
import { slugify } from "../lib/utils";

const PX = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`;

const L = {
  pump: "/images/products/electric-breast-pump.jpg",
  bottles: "/images/products/anti-colic-bottle-set.jpg",
  belly: "/images/products/maternity-belly-band.jpg",
  bra: "/images/products/seamless-maternity-bra.jpg",
  pillow: "/images/products/c-shaped-nursing-pillow.jpg",
  dress: "/images/products/maternity-maxi-dress.jpg",
  leggings: "/images/products/maternity-leggings.jpg",
};

/**
 * Keyword → image rules (first match wins).
 * Order matters: more specific keywords first.
 */
const IMAGE_RULES: { keys: string[]; img: string }[] = [
  // ---- NEW batch from images2.zip (exact name match, first wins) ----
  { keys: ["newborn baby bodysuit"], img: "/images/products/newborn-baby-bodysuit.jpg" },
  { keys: ["full body support band", "full-body support", "full belly support"], img: "/images/products/full-body-support-band.jpg" },
  { keys: ["maternity back support", "back support belt", "maternity backsupport"], img: "/images/products/maternity-back-support-belt.jpg" },
  { keys: ["adjustable pregnancy belt", "adjustable pragnancy"], img: "/images/products/adjustable-pregnancy-belt.jpg" },
  { keys: ["seamless belly band"], img: "/images/products/seamless-belly-band.jpg" },
  { keys: ["maternity compression band"], img: "/images/products/maternity-compression-band.jpg" },
  { keys: ["3 in 1 pregnancy support", "3in1 pregnancy", "3 in 1 pragnancy"], img: "/images/products/3in1-pregnancy-support-belt.jpg" },
  { keys: ["maternity lounge set"], img: "/images/products/maternity-lounge-set.jpg" },
  { keys: ["soft cotton pajama"], img: "/images/products/soft-cotton-pajama-set.jpg" },
  { keys: ["nursing pajama"], img: "/images/products/nursing-pajama-set.jpg" },
  { keys: ["maternity sleep shirt"], img: "/images/products/maternity-sleep-shirt.jpg" },
  { keys: ["oversized lounge", "oversizd lounge"], img: "/images/products/oversized-lounge-t-shirt.jpg" },
  { keys: ["maternity jogger set"], img: "/images/products/maternity-jogger-set.jpg" },
  { keys: ["ribbed lounge set"], img: "/images/products/ribbed-lounge-set.jpg" },
  { keys: ["cozy cardigan"], img: "/images/products/cozy-cardigan.jpg" },
  { keys: ["maternity hoodie"], img: "/images/products/maternity-hoodie.jpg" },
  { keys: ["relaxed fit sweatpants"], img: "/images/products/relaxed-fit-sweatpants.jpg" },
  { keys: ["nursing t-shirt", "nursing t shirt"], img: "/images/products/nursing-t-shirt.jpg" },
  { keys: ["nursing tank top"], img: "/images/products/nursing-tank-top.jpg" },
  { keys: ["nursing kurti"], img: "/images/products/nursing-kurti.jpg" },
  { keys: ["nursing night dress", "nursing nightdress"], img: "/images/products/nursing-night-dress.jpg" },
  { keys: ["nursing hoodie"], img: "/images/products/nursing-hoodie.jpg" },
  { keys: ["nursing blouse"], img: "/images/products/nursing-blouse.jpg" },
  { keys: ["button-down nursing", "button down nursing"], img: "/images/products/button-down-nursing-top.jpg" },
  { keys: ["side-zip nursing", "side zip nursing"], img: "/images/products/side-zip-nursing-top.jpg" },
  { keys: ["nursing tunic"], img: "/images/products/nursing-tunic.jpg" },
  { keys: ["under-bump legging", "under bump legging"], img: "/images/products/under-bump-leggings.jpg" },
  { keys: ["maternity joggers"], img: "/images/products/maternity-joggers.jpg" },
  { keys: ["maternity lounge pants"], img: "/images/products/maternity-lounge-pants.jpg" },
  { keys: ["stretch maternity jeans"], img: "/images/products/stretch-maternity-jeans.jpg" },
  { keys: ["maternity trousers"], img: "/images/products/maternity-trousers.jpg" },
  { keys: ["nursing dress"], img: "/images/products/nursing-dress.jpg" },
  { keys: ["anti colic bottle", "anti-colic bottle"], img: "/images/products/anti-colic-bottle.jpg" },
  { keys: ["silicone feeding spoon", "silicon feeding spoon"], img: "/images/products/silicone-feeding-spoon.jpg" },
  { keys: ["baby suction bowl"], img: "/images/products/baby-suction-bowl.jpg" },
  { keys: ["baby feeding cup"], img: "/images/products/baby-feeding-cup.jpg" },
  { keys: ["baby food feeder"], img: "/images/products/baby-food-feeder.jpg" },
  { keys: ["full coverage nursing"], img: "/images/products/full-coverage-nursing-bra.jpg" },
  { keys: ["lace nursing bra", "lace nursing"], img: "/images/products/lace-nursing-bra.jpg" },
  { keys: ["sleep nursing bra", "sleep nursing"], img: "/images/products/sleep-nursing-bra.jpg" },
  { keys: ["padded nursing bra", "padded nursing"], img: "/images/products/padded-nursing-bra.jpg" },
  { keys: ["pumping bra"], img: "/images/products/pumping-bra.jpg" },
  { keys: ["portable nursing pillow"], img: "/images/products/portable-nursing-pillow.jpg" },
  { keys: ["memory foam nursing pillow", "memeory foam"], img: "/images/products/memory-foam-nursing-pillow.jpg" },
  { keys: ["twin nursing pillow"], img: "/images/products/twin-nursing-pillow.jpg" },
  { keys: ["newborn feeding pillow"], img: "/images/products/newborn-feeding-pillow.jpg" },
  { keys: ["nursing pillow cover"], img: "/images/products/nursing-pillow-cover.jpg" },
  { keys: ["maternity basic t-shirt", "maternity basic t shirt"], img: "/images/products/maternity-basic-t-shirt.jpg" },
  { keys: ["ribbed maternity top"], img: "/images/products/ribbed-maternity-top.jpg" },
  { keys: ["maternity blouse"], img: "/images/products/maternity-blouse.jpg" },
  { keys: ["wrap maternity top"], img: "/images/products/wrap-maternity-top.jpg" },
  { keys: ["off-shoulder maternity", "off shoulder maternity"], img: "/images/products/off-shoulder-maternity-top.jpg" },
  { keys: ["floral maternity blouse"], img: "/images/products/floral-maternity-blouse.jpg" },
  { keys: ["long-sleeve maternity top", "long sleeve maternity"], img: "/images/products/long-sleeve-maternity-top.jpg" },
  { keys: ["short-sleeve maternity top", "short sleeve maternity"], img: "/images/products/short-sleeve-maternity-top.jpg" },
  { keys: ["button-down maternity shirt", "button down maternity", "botton down maternity"], img: "/images/products/button-down-maternity-shirt.jpg" },
  { keys: ["maternity peplum top"], img: "/images/products/maternity-peplum-top.jpg" },
  { keys: ["maternity office trousers", "maternity office trouser"], img: "/images/products/maternity-office-trousers.jpg" },
  { keys: ["maternity cardigan"], img: "/images/products/maternity-cardigan.jpg" },
  { keys: ["maternity cotton brief"], img: "/images/products/maternity-cotton-briefs.jpg" },
  { keys: ["high-waist maternity brief", "high waist maternity brief"], img: "/images/products/maternity-cotton-briefs.jpg" },
  { keys: ["seamless maternity underwear"], img: "/images/products/seamless-maternity-underwear.jpg" },
  { keys: ["over-bump underwear", "over bump underwear"], img: "/images/products/over-bump-underwear.jpg" },
  { keys: ["under-bump underwear", "under bump underwear"], img: "/images/products/under-bump-underwear.jpg" },
  { keys: ["postpartum brief"], img: "/images/products/postpartum-briefs.jpg" },
  { keys: ["disposable maternity underwear", "dispoasable"], img: "/images/products/disposable-maternity-underwear.jpg" },
  { keys: ["lace maternity brief"], img: "/images/products/lace-maternity-briefs.jpg" },
  { keys: ["bamboo maternity brief"], img: "/images/products/bamboo-maternity-briefs.jpg" },
  { keys: ["full-coverage maternity brief", "full coverage maternity brief"], img: "/images/products/full-coverage-maternity-briefs.jpg" },
  { keys: ["nursing trousers", "nursing trouser"], img: "/images/products/nursing-trousers.jpg" },

  // ---- Exact dress product images (unique per product) ----
  { keys: ["maternity maxi dress"], img: "/images/products/maternity-maxi-dress.jpg" },
  { keys: ["wrap maternity dress"], img: "/images/products/wrap-maternity-dress.jpg" },
  { keys: ["floral maternity dress"], img: "/images/products/floral-maternity-dress.jpg" },
  { keys: ["casual maternity dress"], img: "/images/products/casual-maternity-dress.jpg" },
  { keys: ["summer maternity dress"], img: "/images/products/summer-maternity-dress.jpg" },
  { keys: ["maternity evening dress", "evening dress"], img: "/images/products/maternity-evening-dress.jpg" },
  { keys: ["ribbed maternity dress"], img: "/images/products/ribbed-maternity-dress.jpg" },
  { keys: ["nursing maxi dress"], img: "/images/products/nursing-maxi-dress.jpg" },
  { keys: ["nursing nightdress"], img: "/images/products/nursing-nightdress.jpg" },
  { keys: ["maternity office dress", "office dress"], img: "/images/products/maternity-office-dress.jpg" },
  { keys: ["maternity pencil skirt", "pencil skirt"], img: "/images/products/maternity-pencil-skirt.jpg" },
  { keys: ["maternity office jumpsuit", "office jumpsuit"], img: "/images/products/maternity-office-jumpsuit.jpg" },
  { keys: ["maternity blazer", "blazer"], img: "/images/products/maternity-blazer.jpg" },
  { keys: ["party maternity dress", "party dress"], img: "/images/products/party-maternity-dress.jpg" },
  { keys: ["maternity midi dress", "midi dress"], img: "/images/products/maternity-midi-dress.jpg" },

  // ---- Bras (unique per product) ----
  { keys: ["seamless maternity bra"], img: "/images/products/seamless-maternity-bra.jpg" },
  { keys: ["nursing bra"], img: "/images/products/nursing-bra.jpg" },
  { keys: ["wireless maternity bra", "wireless"], img: "/images/products/wireless-maternity-bra.jpg" },
  { keys: ["sports maternity bra", "sports maternity"], img: "/images/products/sports-maternity-bra.jpg" },
  { keys: ["front-open nursing", "front-open"], img: "/images/products/front-open-nursing-bra.jpg" },

  // ---- Shapewear (unique) ----
  { keys: ["maternity shaping shorts"], img: "/images/products/maternity-shaping-shorts.jpg" },
  { keys: ["postpartum shaping brief"], img: "/images/products/postpartum-shaping-brief.jpg" },
  { keys: ["high-waist shapewear"], img: "/images/products/high-waist-shapewear.jpg" },
  { keys: ["seamless shaping shorts"], img: "/images/products/seamless-shaping-shorts.jpg" },
  { keys: ["postpartum support shorts"], img: "/images/products/postpartum-support-shorts.jpg" },
  { keys: ["maternity compression leggings"], img: "/images/products/maternity-compression-leggings.jpg" },
  { keys: ["full-body shapewear", "full-body shape"], img: "/images/products/full-body-shapewear.jpg" },
  { keys: ["tummy support brief"], img: "/images/products/tummy-support-brief.jpg" },
  { keys: ["high-waist support panty"], img: "/images/products/high-waist-support-panty.jpg" },
  { keys: ["postpartum body shaper"], img: "/images/products/postpartum-body-shaper.jpg" },

  // ---- Breast Pumps (unique) ----
  { keys: ["electric breast pump"], img: "/images/products/electric-breast-pump.jpg" },
  { keys: ["double electric breast pump", "double electric"], img: "/images/products/double-electric-breast-pump.jpg" },
  { keys: ["manual breast pump"], img: "/images/products/manual-breast-pump.jpg" },
  { keys: ["wearable breast pump", "wearable"], img: "/images/products/wearable-breast-pump.jpg" },
  { keys: ["hands-free breast pump", "hands-free"], img: "/images/products/hands-free-breast-pump.jpg" },
  { keys: ["portable breast pump", "portable"], img: "/images/products/portable-breast-pump.jpg" },
  { keys: ["hospital-grade breast pump", "hospital-grade"], img: "/images/products/hospital-grade-breast-pump.jpg" },
  { keys: ["silicone breast pump", "silicone breast"], img: "/images/products/silicone-breast-pump.jpg" },
  { keys: ["breast pump starter kit", "pump starter"], img: "/images/products/breast-pump-starter-kit.jpg" },
  { keys: ["breast pump replacement kit", "pump replacement"], img: "/images/products/breast-pump-replacement-kit.jpg" },
  { keys: ["pumping bra"], img: "/images/products/pumping-bra.jpg" },

  // ---- Leggings / Bottoms (unique high-quality) ----
  { keys: ["over-bump legging"], img: "/images/products/over-bump-leggings.jpg" },
  { keys: ["under-bump legging"], img: "/images/products/under-bump-leggings.jpg" },
  { keys: ["maternity legging"], img: "/images/products/maternity-leggings.jpg" },
  { keys: ["ribbed maternity legging"], img: "/images/products/ribbed-maternity-leggings.jpg" },
  { keys: ["maternity palazzo"], img: "/images/products/maternity-palazzo-pants.jpg" },
  { keys: ["ribbed maternity pants"], img: "/images/products/ribbed-maternity-pants.jpg" },
  { keys: ["maternity shorts"], img: "/images/products/maternity-shorts.jpg" },
  { keys: ["maternity bike short", "bike short"], img: "/images/products/maternity-bike-shorts.jpg" },
  { keys: ["maternity denim short", "denim short"], img: "/images/products/maternity-denim-shorts.jpg" },
  { keys: ["maternity lace short", "lace short"], img: "/images/products/maternity-lace-shorts.jpg" },
  { keys: ["under-bump short"], img: "/images/products/under-bump-shorts.jpg" },
  { keys: ["maternity shaping shorts", "shaping short"], img: "/images/products/maternity-shaping-shorts.jpg" },
  { keys: ["seamless shaping", "thigh slim"], img: "/images/products/seamless-shaping-shorts.jpg" },
  { keys: ["postpartum support short", "postpartum recovery short"], img: "/images/products/postpartum-support-shorts.jpg" },
  { keys: ["maternity compression legging"], img: "/images/products/maternity-compression-leggings.jpg" },

  // ---- Baby Essentials (unique) ----
  { keys: ["bodysuit", "onesie", "newborn baby bodysuit"], img: "/images/products/newborn-gift-set.jpg" },
  { keys: ["swaddle", "baby swaddle"], img: "/images/products/baby-swaddle-blanket.jpg" },
  { keys: ["bib", "baby bib"], img: "/images/products/baby-bib-set.jpg" },
  { keys: ["socks", "baby socks"], img: "/images/products/baby-socks-set.jpg" },
  { keys: ["mittens", "mitten", "baby mittens"], img: "/images/products/baby-mittens.jpg" },
  { keys: ["hooded towel", "baby hooded"], img: "/images/products/baby-hooded-towel.jpg" },
  { keys: ["burp cloth", "baby burp"], img: "/images/products/baby-burp-cloths.jpg" },
  { keys: ["changing mat", "baby changing"], img: "/images/products/baby-changing-mat.jpg" },
  { keys: ["sleeping bag", "sleep sack", "baby sleeping"], img: "/images/products/baby-sleeping-bag.jpg" },
  { keys: ["gift set", "newborn gift"], img: "/images/products/newborn-gift-set.jpg" },

  // ---- Belly Support (unique) ----
  { keys: ["maternity belly band"], img: "/images/products/maternity-belly-band.jpg" },
  { keys: ["pregnancy support belt"], img: "/images/products/pregnancy-support-belt.jpg" },
  { keys: ["postpartum wrap", "3-in-1", "postpartum belly wrap"], img: "/images/products/postpartum-wrap-3in1.jpg" },
  { keys: ["pelvic support belt", "pelvic support"], img: "/images/products/pelvic-support-belt.jpg" },
  { keys: ["core restore", "supportive wrap"], img: "/images/products/core-restore-supportive-wrap.jpg" },
  { keys: ["full belly support", "maternity back support", "adjustable pregnancy", "seamless belly band", "maternity compression band"], img: "/images/products/maternity-belly-band.jpg" },
  // fallback
  { keys: ["belly band", "belly wrap", "support band", "support belt", "pregnancy belt", "back support", "pelvic", "compression band"], img: "/images/products/maternity-belly-band.jpg" },

  // ---- Bottoms (fallback) ----
  { keys: ["legging"], img: L.leggings },
  { keys: ["joggers", "lounge pants", "sweatpants"], img: PX(31961168) },
  { keys: ["palazzo", "shorts"], img: L.leggings },
  { keys: ["jeans"], img: PX(7764608) },
  { keys: ["trousers", "office trousers"], img: PX(7764609) },
  { keys: ["pants"], img: PX(31961168) },

  // ---- Breast Pumps ----
  { keys: ["breast pump", "pumping", "pump starter", "pump replacement", "silicone breast", "wearable breast", "hands-free breast", "hospital-grade", "electric breast", "manual breast", "portable breast", "double electric"], img: L.pump },

  // ---- Dresses (fallback for remaining) ----
  { keys: ["midi dress", "nursing dress", "party maternity dress", "dress"], img: L.dress },

  // ---- Feeding Aids (unique) ----
  { keys: ["anti-colic bottle", "anti-colic"], img: "/images/products/anti-colic-bottle-set.jpg" },
  { keys: ["nursing bottle set", "nursing bottle starter", "bottle starter"], img: "/images/products/nursing-bottle-starter-set.jpg" },
  { keys: ["bottle warmer"], img: "/images/products/bottle-warmer.jpg" },
  { keys: ["bottle sterilizer", "sterilizer"], img: "/images/products/bottle-sterilizer.jpg" },
  { keys: ["formula dispenser", "baby formula"], img: "/images/products/formula-dispenser.jpg" },
  { keys: ["feeding bottle", "baby feeding bottle", "nursing bottle", "bottle set", "bottle"], img: "/images/products/baby-bottles.jpg" },
  { keys: ["feeding spoon", "spoon"], img: PX(8015482) },
  { keys: ["suction bowl", "bowl"], img: PX(5632335) },
  { keys: ["feeding cup", "cup", "food feeder"], img: PX(6682950) },

  // ---- Loungewear ----
  { keys: ["lounge set", "pajama", "pyjama", "sleep shirt", "jogger set", "ribbed lounge"], img: PX(30263570) }, // folded cozy knits
  { keys: ["hoodie", "sweatpants"], img: PX(31961168) },
  { keys: ["cardigan"], img: PX(9603625) }, // cardigan sweaters
  { keys: ["oversized lounge", "lounge t-shirt", "t-shirt"], img: PX(34156905) }, // folded tee
  { keys: ["lounge", "cozy"], img: PX(14641430) },

  // ---- Mama Skincare (unique) ----
  { keys: ["stretch mark"], img: "/images/products/stretch-mark-cream.jpg" },
  { keys: ["belly butter"], img: "/images/products/belly-butter.jpg" },
  { keys: ["maternity body lotion", "body lotion"], img: "/images/products/maternity-body-lotion.jpg" },
  { keys: ["pregnancy-safe face moisturizer", "face moisturizer"], img: "/images/products/pregnancy-safe-face-moisturizer.jpg" },
  { keys: ["hydrating body oil", "body oil"], img: "/images/products/hydrating-body-oil.jpg" },
  { keys: ["belly massage oil", "massage oil"], img: "/images/products/belly-massage-oil.jpg" },
  { keys: ["gentle body wash", "body wash"], img: "/images/products/gentle-body-wash.jpg" },
  { keys: ["pregnancy-safe face cleanser", "face cleanser", "cleanser"], img: "/images/products/pregnancy-safe-face-cleanser.jpg" },
  { keys: ["hand & foot", "hand and foot", "hand foot cream"], img: "/images/products/hand-foot-cream.jpg" },
  { keys: ["postpartum recovery balm", "recovery balm", "balm"], img: "/images/products/postpartum-recovery-balm.jpg" },
  { keys: ["skincare", "cream"], img: "/images/products/stretch-mark-cream.jpg" },

  // ---- Maternity Bras ----
  { keys: ["nursing bra", "maternity bra", "wireless", "sports maternity", "sleep nursing", "padded nursing", "front-open", "pumping bra", "lace nursing", "full coverage nursing", "seamless maternity bra", "bra"], img: L.bra },

  // ---- Nursing Pillows (unique) ----
  { keys: ["c-shaped nursing pillow", "c-shaped"], img: "/images/products/c-shaped-nursing-pillow.jpg" },
  { keys: ["u-shaped nursing pillow", "u-shaped"], img: "/images/products/nursing-pillow-set.jpg" },
  { keys: ["adjustable nursing pillow", "adjustable"], img: "/images/products/adjustable-nursing-pillow.jpg" },
  { keys: ["floral nursing", "organic cotton nursing"], img: "/images/products/floral-nursing-pillow.jpg" },
  { keys: ["pregnancy & nursing pillow", "memory foam nursing", "twin nursing", "portable nursing", "newborn feeding pillow", "nursing pillow cover", "nursing pillow", "feeding pillow", "pillow"], img: "/images/products/nursing-pillow-set.jpg" },

  // ---- Nursing Wear / Tops ----
  { keys: ["nursing t-shirt", "nursing tank", "nursing kurti", "nursing nightdress", "nursing hoodie", "nursing blouse", "button-down nursing", "side-zip", "nursing tunic", "nursing maxi"], img: PX(37704850) }, // tee on hanger
  { keys: ["nursing"], img: PX(9594681) },

  // ---- Shapewear ----
  { keys: ["shaping short", "shaping brief", "shapewear", "body shaper", "support short", "support panty", "tummy support", "compression legging", "high-waist shape", "full-body shape"], img: L.bra },

  // ---- Tops & Blouses ----
  { keys: ["basic t-shirt", "ribbed maternity top", "short-sleeve maternity"], img: PX(34156905) },
  { keys: ["wrap maternity top", "off-shoulder", "peplum"], img: PX(37704850) },
  { keys: ["floral maternity blouse", "maternity blouse", "formal blouse"], img: PX(9594681) },
  { keys: ["long-sleeve maternity", "button-down maternity shirt", "button-up shirt"], img: PX(37704849) },
  { keys: ["blouse", "shirt", "top", "tunic"], img: PX(37704850) },

  // ---- Underwear ----
  { keys: ["lace maternity briefs", "lace"], img: PX(11481726) },
  { keys: ["disposable maternity"], img: PX(6303698) },
  { keys: ["over-bump underwear", "high-waist maternity", "full-coverage"], img: PX(9111557) },
  { keys: ["under-bump underwear", "seamless maternity underwear", "bamboo"], img: PX(6989157) },
  { keys: ["cotton briefs", "postpartum briefs", "briefs", "underwear", "undies", "panty"], img: PX(9111557) },

  // ---- Workwear ----
  { keys: ["blazer", "suit set"], img: PX(8346041) },
  { keys: ["office dress", "pencil skirt", "office jumpsuit"], img: L.dress },
  { keys: ["office trousers"], img: PX(7764609) },
  { keys: ["button-up shirt", "formal blouse", "work tunic"], img: PX(37704850) },
  { keys: ["maternity cardigan"], img: PX(9603625) },
  { keys: ["office", "workwear", "formal"], img: PX(8274720) },
];

function imageFor(name: string): string {
  const n = name.toLowerCase();
  for (const rule of IMAGE_RULES) {
    if (rule.keys.some((k) => n.includes(k))) return rule.img;
  }
  // fallback: clean folded clothing
  return PX(9603625);
}

const CLOTHING = ["XS", "S", "M", "L", "XL", "XXL"];
const BRA = ["S", "M", "L", "XL", "XXL"];
const ONE = ["One Size"];

type Seed = {
  name: string;
  cat: string;
  occ: string;
  price: number;
  tris: string[];
  nursing?: boolean;
  three?: boolean;
  rentable?: boolean;
  sizes: string[];
  desc: string;
};

function make(
  names: string[],
  cat: string,
  sizes: string[],
  basePrice: number,
  tris: string[],
  opts: Partial<Seed> = {},
): Seed[] {
  return names.map((name, i) => ({
    name,
    cat,
    occ: opts.occ || "everyday",
    price: Math.round((basePrice + (i % 5) * (basePrice * 0.12) + (i % 3) * 3) * 100) / 100,
    tris: opts.tris || tris,
    nursing: opts.nursing,
    three: opts.three,
    rentable: opts.rentable && i % 3 === 0,
    sizes,
    desc:
      opts.desc ||
      `The ${name} is thoughtfully designed for comfort through pregnancy and beyond. Soft, stretch-friendly materials and mama-first details make this a daily essential.`,
  }));
}

async function main() {
  console.log("🌱 Seeding Mabelle Bump with matched product images...");

  await db.delete(reviews);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(blogPosts);
  await db.delete(coupons);
  await db.delete(users);

  const hash = await bcrypt.hash("password123", 10);

  const [admin] = await db
    .insert(users)
    .values({ name: "Ava Admin", email: "admin@mabellebump.com", passwordHash: hash, role: "admin" })
    .returning();

  const [vendor1] = await db
    .insert(users)
    .values({ name: "Willow & Bloom Boutique", email: "vendor@mabellebump.com", passwordHash: hash, role: "vendor" })
    .returning();

  const [vendor2] = await db
    .insert(users)
    .values({ name: "Mama Muse Atelier", email: "vendor2@mabellebump.com", passwordHash: hash, role: "vendor" })
    .returning();

  const [customer] = await db
    .insert(users)
    .values({
      name: "Sophie Customer",
      email: "customer@mabellebump.com",
      passwordHash: hash,
      role: "customer",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10),
      addresses: [
        {
          id: "addr1",
          label: "Home",
          line1: "42 Rosewood Lane",
          city: "Portland",
          state: "OR",
          zip: "97201",
          country: "USA",
        },
      ],
    })
    .returning();

  const catData: [string, string][] = [
    ["Baby Essentials", "Everything your newborn needs from day one."],
    ["Belly Support", "Belly bands, belts and wraps for comfort & recovery."],
    ["Bottoms & Leggings", "Over-the-belly leggings, jeans and trousers."],
    ["Breast Pumps", "Electric, manual and wearable pumps."],
    ["Dresses", "Flowing, adjustable dresses for every stage."],
    ["Feeding Aids", "Bottles, warmers, sterilizers and feeding tools."],
    ["Loungewear", "Soft, cozy sets for rest and nesting."],
    ["Mama Skincare", "Stretch-mark oils, balms and bump-safe skincare."],
    ["Maternity Bras", "Supportive seamless nursing & maternity bras."],
    ["Nursing Pillows", "Feeding & pregnancy support pillows."],
    ["Nursing Wear", "Easy-access styles for the postpartum months."],
    ["Shapewear", "Gentle bump support and postpartum shaping."],
    ["Tops & Blouses", "Bump-friendly tops from casual to polished."],
    ["Underwear", "Over-bump & postpartum underwear that stays put."],
    ["Workwear", "Polished maternity pieces for the office."],
  ];

  const cats = await db
    .insert(categories)
    .values(catData.map(([name, description]) => ({ name, slug: slugify(name), description })))
    .returning();

  const catId = (name: string) => cats.find((c) => c.name === name)!.id;

  const ALL: Seed[] = [
    ...make(
      ["Newborn Baby Bodysuit", "Baby Swaddle Blanket", "Baby Bib Set", "Baby Socks Set", "Baby Mittens", "Baby Hooded Towel", "Baby Burp Cloths", "Baby Changing Mat", "Baby Sleeping Bag", "Newborn Gift Set"],
      "Baby Essentials", ONE, 22, ["postpartum"],
    ),
    ...make(
      ["Maternity Belly Band", "Pregnancy Support Belt", "Full Belly Support Band", "Maternity Back Support Belt", "Adjustable Pregnancy Belt", "Postpartum Belly Wrap", "Pelvic Support Belt", "Seamless Belly Band", "Maternity Compression Band", "3-in-1 Pregnancy Support Belt"],
      "Belly Support", ONE, 36, ["2nd", "3rd", "postpartum"],
    ),
    ...make(
      ["Maternity Leggings", "Over-Bump Leggings", "Under-Bump Leggings", "Maternity Joggers", "Maternity Lounge Pants", "Stretch Maternity Jeans", "Maternity Palazzo Pants", "Maternity Trousers", "Maternity Shorts", "Ribbed Maternity Pants"],
      "Bottoms & Leggings", CLOTHING, 42, ["1st", "2nd", "3rd"], { occ: "activewear" },
    ),
    ...make(
      ["Electric Breast Pump", "Double Electric Breast Pump", "Manual Breast Pump", "Wearable Breast Pump", "Hands-Free Breast Pump", "Portable Breast Pump", "Hospital-Grade Breast Pump", "Silicone Breast Pump", "Breast Pump Starter Kit", "Breast Pump Replacement Kit"],
      "Breast Pumps", ONE, 89, ["postpartum"], { nursing: true },
    ),
    ...make(
      ["Maternity Maxi Dress", "Maternity Midi Dress", "Nursing Dress", "Wrap Maternity Dress", "Floral Maternity Dress", "Casual Maternity Dress", "Party Maternity Dress", "Ribbed Maternity Dress", "Summer Maternity Dress", "Maternity Evening Dress"],
      "Dresses", CLOTHING, 78, ["2nd", "3rd"], { occ: "occasion", nursing: true, three: true, rentable: true },
    ),
    ...make(
      ["Baby Feeding Bottle", "Anti-Colic Bottle", "Bottle Warmer", "Bottle Sterilizer", "Baby Formula Dispenser", "Silicone Feeding Spoon", "Baby Suction Bowl", "Baby Feeding Cup", "Baby Food Feeder", "Nursing Bottle Set"],
      "Feeding Aids", ONE, 24, ["postpartum"],
    ),
    ...make(
      ["Maternity Lounge Set", "Soft Cotton Pajama Set", "Nursing Pajama Set", "Maternity Sleep Shirt", "Oversized Lounge T-Shirt", "Maternity Jogger Set", "Ribbed Lounge Set", "Cozy Cardigan", "Maternity Hoodie", "Relaxed Fit Sweatpants"],
      "Loungewear", CLOTHING, 58, ["2nd", "3rd", "postpartum"], { occ: "loungewear", nursing: true, three: true, rentable: true },
    ),
    ...make(
      ["Stretch Mark Cream", "Belly Butter", "Maternity Body Lotion", "Pregnancy-Safe Face Moisturizer", "Hydrating Body Oil", "Belly Massage Oil", "Gentle Body Wash", "Pregnancy-Safe Face Cleanser", "Hand & Foot Cream", "Postpartum Recovery Balm"],
      "Mama Skincare", ONE, 18, ["1st", "2nd", "3rd", "postpartum"],
    ),
    ...make(
      ["Seamless Maternity Bra", "Nursing Bra", "Wireless Maternity Bra", "Full Coverage Nursing Bra", "Lace Nursing Bra", "Sports Maternity Bra", "Sleep Nursing Bra", "Padded Nursing Bra", "Front-Open Nursing Bra", "Pumping Bra"],
      "Maternity Bras", BRA, 32, ["2nd", "3rd", "postpartum"], { nursing: true },
    ),
    ...make(
      ["U-Shaped Nursing Pillow", "C-Shaped Nursing Pillow", "Adjustable Nursing Pillow", "Pregnancy & Nursing Pillow", "Memory Foam Nursing Pillow", "Organic Cotton Nursing Pillow", "Portable Nursing Pillow", "Twin Nursing Pillow", "Newborn Feeding Pillow", "Nursing Pillow Cover"],
      "Nursing Pillows", ONE, 48, ["3rd", "postpartum"], { nursing: true },
    ),
    ...make(
      ["Nursing T-Shirt", "Nursing Tank Top", "Nursing Kurti", "Nursing Maxi Dress", "Nursing Nightdress", "Nursing Hoodie", "Nursing Blouse", "Button-Down Nursing Top", "Side-Zip Nursing Top", "Nursing Tunic"],
      "Nursing Wear", CLOTHING, 38, ["3rd", "postpartum"], { nursing: true, three: true },
    ),
    ...make(
      ["Maternity Shaping Shorts", "Postpartum Shaping Brief", "High-Waist Shapewear", "Seamless Shaping Shorts", "Postpartum Support Shorts", "Maternity Compression Leggings", "Full-Body Shapewear", "Tummy Support Brief", "High-Waist Support Panty", "Postpartum Body Shaper"],
      "Shapewear", BRA, 44, ["2nd", "3rd", "postpartum"],
    ),
    ...make(
      ["Maternity Basic T-Shirt", "Ribbed Maternity Top", "Maternity Blouse", "Wrap Maternity Top", "Off-Shoulder Maternity Top", "Floral Maternity Blouse", "Long-Sleeve Maternity Top", "Short-Sleeve Maternity Top", "Button-Down Maternity Shirt", "Maternity Peplum Top"],
      "Tops & Blouses", CLOTHING, 34, ["1st", "2nd", "3rd"],
    ),
    ...make(
      ["Maternity Cotton Briefs", "High-Waist Maternity Briefs", "Seamless Maternity Underwear", "Over-Bump Underwear", "Under-Bump Underwear", "Postpartum Briefs", "Disposable Maternity Underwear", "Lace Maternity Briefs", "Bamboo Maternity Briefs", "Full-Coverage Maternity Briefs"],
      "Underwear", BRA, 22, ["1st", "2nd", "3rd", "postpartum"],
    ),
    ...make(
      ["Maternity Office Trousers", "Maternity Blazer", "Maternity Office Dress", "Maternity Pencil Skirt", "Maternity Button-Up Shirt", "Maternity Formal Blouse", "Maternity Suit Set", "Maternity Work Tunic", "Maternity Cardigan", "Maternity Office Jumpsuit"],
      "Workwear", CLOTHING, 68, ["1st", "2nd", "3rd"], { occ: "workwear", rentable: true },
    ),
  ];

  // Preview a few mappings for sanity
  console.log("   Sample image matches:");
  for (const sample of ["Electric Breast Pump", "Maternity Maxi Dress", "Over-Bump Leggings", "Nursing Bra", "Maternity Belly Band", "Baby Feeding Bottle", "U-Shaped Nursing Pillow", "Stretch Mark Cream", "Newborn Baby Bodysuit", "Maternity Blazer"]) {
    console.log(`     ${sample} → ${imageFor(sample).slice(0, 70)}`);
  }

  console.log(`   Inserting ${ALL.length} products...`);

  const inserted = await db
    .insert(products)
    .values(
      ALL.map((p, i) => ({
        name: p.name,
        slug: `${slugify(p.name)}-${i + 1}`,
        description: `${p.desc}${p.three ? " Designed to be worn three ways — through pregnancy, nursing, and beyond." : ""}`,
        price: p.price,
        compareAtPrice: i % 2 === 0 ? Math.round(p.price * 1.35 * 100) / 100 : null,
        image: imageFor(p.name),
        categoryId: catId(p.cat),
        trimesterTags: p.tris,
        sizes: p.sizes,
        occasion: p.occ,
        stock: 8 + ((i * 5) % 45),
        isRentable: !!p.rentable,
        wearItThreeWays: !!p.three,
        nursingFriendly: !!p.nursing,
        featured: i < 8,
        vendorId: i % 2 === 0 ? vendor1.id : vendor2.id,
      })),
    )
    .returning();

  const reviewSeed = [
    [5, "Absolutely lived in this through my whole third trimester. So soft!"],
    [4, "Great fit and adjustable — sizing runs true."],
    [5, "The wear-it-three-ways feature is genius. Still wearing post-baby."],
    [5, "Perfect quality — highly recommend to every mama."],
    [4, "Comfortable, beautiful and arrived quickly."],
  ] as const;

  for (const p of inserted.slice(0, 40)) {
    const [rating, comment] = reviewSeed[Math.floor(Math.random() * reviewSeed.length)];
    await db.insert(reviews).values({
      productId: p.id,
      userId: customer.id,
      userName: customer.name,
      rating,
      comment,
    });
  }

  type Guide = { title: string; excerpt: string; tags: string[]; cover: string; content: string };
  const posts: Guide[] = [
    {
      title: "First Trimester Survival Guide: What Your Body Needs",
      excerpt: "Nausea, fatigue and a tiny bump — here's how to dress, rest and care for yourself in weeks 1–13.",
      tags: ["1st trimester", "self-care"],
      cover: PX(9603625),
      content: `The first trimester can feel invisible to the outside world, but huge inside your body. Most mamas feel tired, nauseous and extra sensitive to smells and tight waistbands.\n\nClothes tip: Don't buy a full maternity wardrobe yet. Soft, stretchy waistbands, looser tops and a supportive wireless bra usually get you through.\n\nSelf-care tip: Eat small frequent meals, keep water nearby, and rest without guilt. Short walks and gentle stretching often help more than pushing through exhaustion.\n\nMust-haves: comfortable underwear, a good sleep bra, loose loungewear, and pregnancy-safe skincare for changing skin.\n\nWhen to shop more: If your regular jeans stop buttoning or nausea makes tight clothes unbearable, start with 2–3 bump-friendly basics — not a full closet.`,
    },
    {
      title: "Second Trimester Style: Building a Bump-Friendly Capsule",
      excerpt: "Energy is back and the bump is showing. Build a small capsule wardrobe that grows with you.",
      tags: ["2nd trimester", "style tips"],
      cover: L.dress,
      content: `Many mamas call the second trimester the "honeymoon phase" — more energy, a clearer bump, and clothes that finally need a rethink.\n\nStart with these 5 pieces:\n1. Over-bump leggings\n2. A wrap or empire-waist dress\n3. 2–3 stretchy everyday tops\n4. A supportive belly band for longer days\n5. A soft wireless maternity bra\n\nFit tip: Choose fabrics with stretch and adjustable details (side ruching, wrap fronts, panel waistbands). You should still be able to wear most pieces into the third trimester.\n\nWork tip: Pair maternity trousers with a longer blouse or soft blazer. You don't need a whole new office wardrobe — just smarter layers.\n\nSave money: Buy fewer, better pieces and rent occasion wear for events.`,
    },
    {
      title: "Third Trimester Comfort Checklist",
      excerpt: "Swelling, back aches and a full bump — comfort is everything now. Use this practical checklist.",
      tags: ["3rd trimester", "self-care"],
      cover: L.belly,
      content: `In the third trimester, comfort beats fashion every time — and that's okay.\n\nDaily comfort checklist:\n• Supportive belly or back belt for standing/walking\n• Soft nursing-ready bras (you'll need them soon)\n• Easy slip-on shoes\n• Loose dresses or stretchy lounge sets\n• Pregnancy pillow for better sleep\n\nBody care: Massage belly oil or butter twice a day, elevate feet when swollen, and drink water even when you don't feel thirsty.\n\nHospital bag clothing: pack a soft robe, disposable postpartum underwear, nursing tops, and socks. Skip anything with complicated zippers.\n\nMindset tip: Your body is doing hard work. Choose clothes that feel kind, not clothes that "hide" you.`,
    },
    {
      title: "Hospital Bag Essentials for Mama & Baby",
      excerpt: "A calm, no-overwhelm list of what to pack — and what you can skip.",
      tags: ["3rd trimester", "essentials"],
      cover: PX(37904241),
      content: `Pack your hospital bag around week 34–36 so you're ready without last-minute stress.\n\nFor mama:\n• Nursing bras (2–3)\n• Front-open or nursing tops\n• Soft robe / cardigan\n• Disposable postpartum underwear\n• Toiletries + lip balm + hair tie\n• Phone charger and going-home outfit\n\nFor baby:\n• 2–3 bodysuits / onesies\n• Soft swaddle or blanket\n• Hat and socks\n• Going-home outfit (season-appropriate)\n\nNice extras: nursing pillow (if hospital allows), nipple cream, snacks, and a water bottle with a straw.\n\nSkip: Too many clothes, full makeup kits, and bulky pillows you won't use.`,
    },
    {
      title: "Breastfeeding Basics: First Two Weeks",
      excerpt: "Latch, supply, pumping and comfort — a gentle starter guide for new nursing mamas.",
      tags: ["breastfeeding", "postpartum"],
      cover: L.bra,
      content: `The first two weeks of breastfeeding are a learning curve for both of you. Feed often, rest when you can, and ask for help early.\n\nHelpful basics:\n• Nurse on demand (often 8–12 times in 24 hours)\n• Watch baby's swallows, not the clock\n• Use a supportive nursing bra day and night\n• Keep nipple cream and nursing pads nearby\n\nPumping: If you're building a freezer stash or returning to work, start slowly after feeding is established. A good double pump and storage bags help a lot.\n\nPain tip: Mild tenderness can be normal at first, but cracked/sore nipples that don't improve need a lactation check. Positioning and latch matter more than "toughing it out."\n\nMust-haves: nursing bras, nursing pads, nipple cream, water bottle, and a comfortable feeding pillow.`,
    },
    {
      title: "How to Choose the Right Nursing Bra",
      excerpt: "Seamless, sports, sleep or pumping bra? Here's how to pick support that actually works.",
      tags: ["breastfeeding", "style tips"],
      cover: L.bra,
      content: `Your breasts change size often in pregnancy and postpartum — so bra strategy matters.\n\nTypes explained:\n• Sleep bra: soft, no wires, great overnight\n• Everyday nursing bra: drop clips + stretch cups\n• Sports maternity bra: for walks and light workouts\n• Pumping bra: keeps flanges hands-free\n\nFit tips:\n• Choose stretchy cups and extra hook rows\n• Prefer wide straps for comfort\n• Re-check size every few weeks in late pregnancy and early postpartum\n\nBuy 2–3 good bras rather than many cheap ones. You'll live in them.\n\nWhen to replace: if the band rides up, straps dig in, or clips become hard to open one-handed with baby in arms.`,
    },
    {
      title: "Belly Bands & Support Belts: Do You Need One?",
      excerpt: "Who benefits from belly support, when to wear it, and how to choose the right style.",
      tags: ["2nd trimester", "3rd trimester", "self-care"],
      cover: L.belly,
      content: `A belly band isn't mandatory — but many mamas feel less back strain and more stability with one.\n\nYou may benefit if you have:\n• Round ligament pain\n• Lower back ache from the bump\n• A standing/walking-heavy day\n• Twins or a larger bump\n\nHow to use: Wear during activity, not necessarily all day. It should feel supportive, not tight enough to restrict breathing.\n\nStyles:\n• Soft seamless belly band under clothes\n• Structured pregnancy support belt for back relief\n• Postpartum wrap for gentle recovery support after birth\n\nTip: Pair with good shoes and posture breaks. A belt helps, but movement and rest matter too.`,
    },
    {
      title: "Postpartum Recovery: First 40 Days",
      excerpt: "Healing, hormones, bleeding and body care — a realistic recovery roadmap for new mamas.",
      tags: ["postpartum", "self-care"],
      cover: L.belly,
      content: `The first 40 days are for healing, not bouncing back. Your only job is recovery and bonding.\n\nBody care basics:\n• Rest as much as possible between feeds\n• Use maternity pads / disposable underwear\n• Keep a peri bottle and soothing cream handy\n• Wear a gentle support wrap if it feels good\n• Eat warm, nourishing meals and drink water\n\nMovement: Short walks are great when cleared by your provider. Skip intense workouts until you get the all-clear, especially after C-section.\n\nEmotions: Mood swings and tears are common. If sadness feels heavy or constant, tell someone and seek help — support is strength.\n\nWardrobe: nursing tops, soft bras, stretchy pants, and easy layers. Comfort is the uniform of early motherhood.`,
    },
    {
      title: "Newborn Essentials Checklist (No Overwhelm)",
      excerpt: "What you actually need for the first weeks — without buying the whole baby aisle.",
      tags: ["postpartum", "essentials"],
      cover: PX(37904241),
      content: `Babies need less stuff than ads suggest. Start simple and add only what you use.\n\nClothing:\n• 5–7 bodysuits\n• 2–3 swaddles/sleep sacks\n• Socks, mittens, hat\n• Soft towels and washcloths\n\nFeeding:\n• Bottles (even if breastfeeding — useful backup)\n• Burp cloths\n• Nursing pillow\n• Breast pump if needed for work/supply\n\nDiapering:\n• Diapers + wipes\n• Changing mat\n• Diaper cream\n\nSleep:\n• Safe bassinet/crib\n• Firm mattress + fitted sheet\n\nSkip for now: too many newborn outfits in one size, complicated gadgets, and duplicates "just in case."`,
    },
    {
      title: "Maternity Workwear That Still Looks Polished",
      excerpt: "Look put-together at the office without sacrificing comfort as your bump grows.",
      tags: ["style tips", "2nd trimester", "3rd trimester"],
      cover: PX(8346041),
      content: `You can stay professional and comfortable — the secret is structure + stretch.\n\nOffice formula:\n• Maternity trousers or a pencil skirt with belly panel\n• Longer blouses that don't ride up\n• Soft blazer or cardigan for meetings\n• Comfortable closed shoes\n\nColor tip: Neutrals mix easily (black, beige, navy, cream). Add one statement blouse or scarf when you want lift.\n\nThird trimester tip: Choose dresses with stretch and add a light blazer. One-piece outfits mean fewer fit issues.\n\nCare tip: Keep a spare nursing-friendly top in your bag later in pregnancy if you're leaking or extra warm.`,
    },
    {
      title: "Safe Skincare in Pregnancy: What to Use & Avoid",
      excerpt: "Keep your glow without risky ingredients. A simple bump-safe routine.",
      tags: ["self-care", "1st trimester"],
      cover: PX(7005933),
      content: `Pregnancy can change skin overnight — oilier, drier, more sensitive, or all three.\n\nGenerally preferred:\n• Gentle cleanser\n• Moisturizer with ceramides/hyaluronic acid\n• Mineral sunscreen\n• Belly butter/oil for stretch comfort\n\nOften avoided unless your doctor says otherwise:\n• High-dose retinol / retinoids\n• Strong chemical peels\n• Certain high-dose salicylic products\n• Some essential oils in high concentration\n\nAlways check labels and ask your provider if unsure.\n\nSimple routine: cleanse, moisturize, SPF by day; cleanse, treat gently, moisturize by night; belly oil after shower.`,
    },
    {
      title: "How to Build a Wear-It-3-Ways Wardrobe",
      excerpt: "Pregnancy → nursing → everyday again. Buy pieces that earn their keep long after birth.",
      tags: ["style tips", "essentials", "postpartum"],
      cover: L.dress,
      content: `The smartest maternity buys work in three chapters of life.\n\nLook for:\n• Wrap tops and dresses (bump-friendly + nursing access)\n• Button-down shirts\n• Soft knit sets\n• Stretch jeans/trousers with a good panel\n• Layering cardigans\n\nExample outfit path:\nPregnancy: wrap dress over leggings\nNursing: same dress with easy opening\nLater: belted as a regular dress\n\nRule of thumb: If a piece only works for 8 weeks, rent it or skip it. If it works for 2+ years, it's worth buying in the best quality you can afford.\n\nMabelle Bump tip: Filter for "Wear it 3 Ways" tags when you shop — those pieces are chosen exactly for this reason.`,
    },
  ];

  for (const post of posts) {
    await db.insert(blogPosts).values({
      title: post.title,
      slug: slugify(post.title),
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.cover,
      author: admin.name,
      tags: post.tags,
    });
  }

  await db.insert(coupons).values([
    { code: "BUMP15", discountType: "percent", discountValue: 15 },
    { code: "WELCOME10", discountType: "fixed", discountValue: 10 },
  ]);

  // Verify distinct images by category
  const byCat: Record<string, Set<string>> = {};
  for (const p of ALL) {
    byCat[p.cat] = byCat[p.cat] || new Set();
    byCat[p.cat].add(imageFor(p.name));
  }
  console.log("   Unique images per category:");
  for (const [c, set] of Object.entries(byCat)) {
    console.log(`     ${c}: ${set.size} unique image(s)`);
  }

  console.log(`✅ Seed complete! ${inserted.length} products with name-matched images.`);
  console.log("   Admin:    admin@mabellebump.com / password123");
  console.log("   Vendor:   vendor@mabellebump.com / password123");
  console.log("   Customer: customer@mabellebump.com / password123");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
