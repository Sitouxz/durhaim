import type { RegionalPrices } from '@/lib/commerce';

export type FigmaCatalogueSeed = {
  name: string;
  slug: string;
  description: string;
  price: number | null;
  regional_prices: RegionalPrices;
  category: string;
  series: { name: string; slug: string };
  colorway: string;
  display_order: number;
  specifications: string[];
  images: string[];
};

export const figmaCatalogueSeeds: FigmaCatalogueSeed[] = [
  {
    "name": "Black Mamba Mark 2",
    "slug": "black-mamba-mark-2",
    "description": "Mamba Series / Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "Black",
    "display_order": 1,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-008231.png"
    ]
  },
  {
    "name": "Multicam Black Mamba Mark 2",
    "slug": "multicam-black-mamba-mark-2",
    "description": "Mamba Series / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "Multicam Black",
    "display_order": 2,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-008391.png"
    ]
  },
  {
    "name": "Black Mamba Modular",
    "slug": "black-mamba-modular",
    "description": "Mamba Series / Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "Black",
    "display_order": 3,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-099341.png"
    ]
  },
  {
    "name": "Green Mamba Modular",
    "slug": "green-mamba-modular",
    "description": "Mamba Series / Green",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "Green",
    "display_order": 4,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-056111.png"
    ]
  },
  {
    "name": "Royale Mamba Modular",
    "slug": "royale-mamba-modular",
    "description": "Mamba Series / Royale",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "Royale",
    "display_order": 5,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-004311.png"
    ]
  },
  {
    "name": "Green Mamba Mark 2",
    "slug": "green-mamba-mark-2",
    "description": "Mamba Series / Green",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "Green",
    "display_order": 6,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-003471.png"
    ]
  },
  {
    "name": "King Mamba Mark 2",
    "slug": "king-mamba-mark-2",
    "description": "Mamba Series / King",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "King",
    "display_order": 7,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/multicam-tropic-1.png"
    ]
  },
  {
    "name": "Royale Mamba Mark 2",
    "slug": "royale-mamba-mark-2",
    "description": "Mamba Series / Royale",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Mamba Series",
      "slug": "mamba-series"
    },
    "colorway": "Royale",
    "display_order": 8,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-000161.png"
    ]
  },
  {
    "name": "Black Cobra",
    "slug": "black-cobra",
    "description": "Cobra Series / Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Black",
    "display_order": 9,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-005611.png"
    ]
  },
  {
    "name": "Black Chitto Mark 2",
    "slug": "black-chitto-mark-2",
    "description": "Chitto Series / Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Chitto Series",
      "slug": "chitto-series"
    },
    "colorway": "Black",
    "display_order": 10,
    "specifications": [
      "Black Color",
      "Laser Cut Design",
      "Fabric 1000 D Triple Coating (Milspec)",
      "Triple Magazine Rifle Modular Pouch (Placard)",
      "Shoulder Quick Release",
      "Cummerbund Quick Release",
      "Laser Cut Molle",
      "Velcro Patch Area",
      "2 Medic/Utility Pouch",
      "Abdomen Pouch",
      "Waterbag/Utility Bag",
      "Weight 2.8 kg",
      "Compatible With Sapi Plate Size M"
    ],
    "images": [
      "/storefront/figma/product/chitto-black/dsc-089012.png",
      "/storefront/figma/product/chitto-black/dsc-089032.png",
      "/storefront/figma/product/chitto-black/dsc-089081.png",
      "/storefront/figma/product/chitto-black/dsc-089131.png",
      "/storefront/figma/product/chitto-black/dsc-089171.png"
    ]
  },
  {
    "name": "Black Viper Mark 2",
    "slug": "black-viper-mark-2",
    "description": "Viper Series / Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Viper Series",
      "slug": "viper-series"
    },
    "colorway": "Black",
    "display_order": 11,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-096541.png"
    ]
  },
  {
    "name": "Green Chitto Mark 2",
    "slug": "green-chitto-mark-2",
    "description": "Chitto Series / Green",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Chitto Series",
      "slug": "chitto-series"
    },
    "colorway": "Green",
    "display_order": 12,
    "specifications": [
      "Green Color",
      "Laser Cut Design",
      "Fabric 1000 D Triple Coating (Milspec)",
      "Triple Magazine Rifle Modular Pouch (Placard)",
      "Shoulder Quick Release",
      "Cummerbund Quick Release",
      "Laser Cut Molle",
      "Velcro Patch Area",
      "2 Medic/Utility Pouch",
      "Abdomen Pouch",
      "Waterbag/Utility Bag",
      "Weight 2.8 kg",
      "Compatible With Sapi Plate Size M"
    ],
    "images": [
      "/storefront/figma/product/chitto-green/gjh-064871.png",
      "/storefront/figma/product/chitto-green/gjh-064842.png",
      "/storefront/figma/product/chitto-green/gjh-064851.png",
      "/storefront/figma/product/chitto-green/gjh-064881.png",
      "/storefront/figma/product/chitto-green/gjh-064891.png"
    ]
  },
  {
    "name": "Green Viper Mark 2",
    "slug": "green-viper-mark-2",
    "description": "Viper Series / Green",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Viper Series",
      "slug": "viper-series"
    },
    "colorway": "Green",
    "display_order": 13,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/mamba-mk-2-mcb-21.png"
    ]
  },
  {
    "name": "Black Thunder",
    "slug": "black-thunder",
    "description": "Thunder Chestrig Series / Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Thunder Chestrig Series",
      "slug": "thunder-chestrig-series"
    },
    "colorway": "Black",
    "display_order": 14,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-004951.png"
    ]
  },
  {
    "name": "King Chitto Mark 2",
    "slug": "king-chitto-mark-2",
    "description": "Chitto Series / King",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Chitto Series",
      "slug": "chitto-series"
    },
    "colorway": "King",
    "display_order": 15,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-098221.png"
    ]
  },
  {
    "name": "Multicam Black Viper Mark 2",
    "slug": "multicam-black-viper-mark-2",
    "description": "Viper Series / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Viper Series",
      "slug": "viper-series"
    },
    "colorway": "Multicam Black",
    "display_order": 16,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-088871.png"
    ]
  },
  {
    "name": "Green Thunder",
    "slug": "green-thunder",
    "description": "Thunder Chestrig Series / Green",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Thunder Chestrig Series",
      "slug": "thunder-chestrig-series"
    },
    "colorway": "Green",
    "display_order": 17,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-006241.png"
    ]
  },
  {
    "name": "Black Aim Vortex",
    "slug": "black-aim-vortex",
    "description": "Aim Vortex Rifle Bag / Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Aim Vortex Rifle Bag",
      "slug": "aim-vortex-rifle-bag"
    },
    "colorway": "Black",
    "display_order": 18,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-076041.png",
      "/storefront/figma/catalogue/open/dsc-065231.png",
      "/storefront/figma/catalogue/open/dpn-1.png"
    ]
  },
  {
    "name": "Multicam Tropic Bite Bee",
    "slug": "multicam-tropic-bite-bee",
    "description": "Bite Bee Handbag / Multicam Tropic",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Bite Bee Handbag",
      "slug": "bite-bee-handbag"
    },
    "colorway": "Multicam Tropic",
    "display_order": 20,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-007961.png"
    ]
  },
  {
    "name": "Black Cobra Backpack",
    "slug": "black-cobra-backpack",
    "description": "Cobra Backpack / Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Cobra Backpack",
      "slug": "cobra-backpack"
    },
    "colorway": "Black",
    "display_order": 21,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-06553-edit-1.png"
    ]
  },
  {
    "name": "Black Dregon Head Backpack",
    "slug": "black-dregon-head-backpack",
    "description": "Dregon Head Backpack / Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Dregon Head Backpack",
      "slug": "dregon-head-backpack"
    },
    "colorway": "Black",
    "display_order": 22,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-09708-edit-1.png"
    ]
  },
  {
    "name": "Multicam Black Bite Bee",
    "slug": "multicam-black-bite-bee",
    "description": "Bite Bee Handbag / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Bite Bee Handbag",
      "slug": "bite-bee-handbag"
    },
    "colorway": "Multicam Black",
    "display_order": 24,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-002301.png"
    ]
  },
  {
    "name": "Black Bite Bee",
    "slug": "black-bite-bee",
    "description": "Bite Bee Handbag / Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Bite Bee Handbag",
      "slug": "bite-bee-handbag"
    },
    "colorway": "Black",
    "display_order": 25,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-089011.png"
    ]
  },
  {
    "name": "Black Dump Pouch",
    "slug": "black-dump-pouch",
    "description": "Dump Pouch / Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Dump Pouch",
      "slug": "dump-pouch"
    },
    "colorway": "Black",
    "display_order": 26,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-064841.png"
    ]
  },
  {
    "name": "Green Dump Pouch",
    "slug": "green-dump-pouch",
    "description": "Dump Pouch / Green",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Dump Pouch",
      "slug": "dump-pouch"
    },
    "colorway": "Green",
    "display_order": 27,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-096591.png"
    ]
  },
  {
    "name": "Royale Dump Pouch",
    "slug": "royale-dump-pouch",
    "description": "Dump Pouch / Royale",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Dump Pouch",
      "slug": "dump-pouch"
    },
    "colorway": "Royale",
    "display_order": 28,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-095211.png"
    ]
  },
  {
    "name": "Multicam Tropic Dump Pouch",
    "slug": "multicam-tropic-dump-pouch",
    "description": "Dump Pouch / Multicam Tropic",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Dump Pouch",
      "slug": "dump-pouch"
    },
    "colorway": "Multicam Tropic",
    "display_order": 29,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-008541.png"
    ]
  },
  {
    "name": "Multicam Dump Pouch",
    "slug": "multicam-dump-pouch",
    "description": "Dump Pouch / Multicam",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Dump Pouch",
      "slug": "dump-pouch"
    },
    "colorway": "Multicam",
    "display_order": 30,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-063701.png"
    ]
  },
  {
    "name": "Multicam Black Dump Pouch",
    "slug": "multicam-black-dump-pouch",
    "description": "Dump Pouch / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Dump Pouch",
      "slug": "dump-pouch"
    },
    "colorway": "Multicam Black",
    "display_order": 31,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-073711.png"
    ]
  },
  {
    "name": "Black Fabric Holster",
    "slug": "black-fabric-holster",
    "description": "Fabric Holster / Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Fabric Holster",
      "slug": "fabric-holster"
    },
    "colorway": "Black",
    "display_order": 32,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-09483-x-1.png"
    ]
  },
  {
    "name": "Black HG Double Mag Pouch",
    "slug": "black-hg-double-mag-pouch",
    "description": "Handgun Double Mag Pouch / Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Handgun Double Mag Pouch",
      "slug": "handgun-double-mag-pouch"
    },
    "colorway": "Black",
    "display_order": 33,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-007971.png"
    ]
  },
  {
    "name": "Green HG Double Mag Pouch",
    "slug": "green-hg-double-mag-pouch",
    "description": "Handgun Double Mag Pouch / Green",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Handgun Double Mag Pouch",
      "slug": "handgun-double-mag-pouch"
    },
    "colorway": "Green",
    "display_order": 34,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-09470-x-1.png"
    ]
  },
  {
    "name": "Royale HG Double Mag Pouch",
    "slug": "royale-hg-double-mag-pouch",
    "description": "Handgun Double Mag Pouch / Royale",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Handgun Double Mag Pouch",
      "slug": "handgun-double-mag-pouch"
    },
    "colorway": "Royale",
    "display_order": 35,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-005461.png"
    ]
  },
  {
    "name": "Multicam Black HG Double Mag Pouch",
    "slug": "multicam-black-hg-double-mag-pouch",
    "description": "Handgun Double Mag Pouch / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Handgun Double Mag Pouch",
      "slug": "handgun-double-mag-pouch"
    },
    "colorway": "Multicam Black",
    "display_order": 36,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-006031.png"
    ]
  },
  {
    "name": "Multicam HG Double Mag Pouch",
    "slug": "multicam-hg-double-mag-pouch",
    "description": "Handgun Double Mag Pouch / Multicam",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Handgun Double Mag Pouch",
      "slug": "handgun-double-mag-pouch"
    },
    "colorway": "Multicam",
    "display_order": 37,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-076341.png"
    ]
  },
  {
    "name": "Multicam Tropic HG Double Mag Pouch",
    "slug": "multicam-tropic-hg-double-mag-pouch",
    "description": "Handgun Double Mag Pouch / Multicam Tropic",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Handgun Double Mag Pouch",
      "slug": "handgun-double-mag-pouch"
    },
    "colorway": "Multicam Tropic",
    "display_order": 38,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-096261.png"
    ]
  },
  {
    "name": "Black Rifle Mag Pouch",
    "slug": "black-rifle-mag-pouch",
    "description": "Rifle Mag Pouch / Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Rifle Mag Pouch",
      "slug": "rifle-mag-pouch"
    },
    "colorway": "Black",
    "display_order": 39,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-000301.png"
    ]
  },
  {
    "name": "Green Rifle Mag Pouch",
    "slug": "green-rifle-mag-pouch",
    "description": "Rifle Mag Pouch / Green",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Rifle Mag Pouch",
      "slug": "rifle-mag-pouch"
    },
    "colorway": "Green",
    "display_order": 40,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-097811.png"
    ]
  },
  {
    "name": "Black Mag Pouch",
    "slug": "black-mag-pouch",
    "description": "Rifle Mag Pouch / Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Rifle Mag Pouch",
      "slug": "rifle-mag-pouch"
    },
    "colorway": "Black",
    "display_order": 41,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-004461.png"
    ]
  },
  {
    "name": "Green Fabric Holster",
    "slug": "green-fabric-holster",
    "description": "Fabric Holster / Green",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Fabric Holster",
      "slug": "fabric-holster"
    },
    "colorway": "Green",
    "display_order": 42,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-097921.png"
    ]
  },
  {
    "name": "Black Snake Head Sling Bag",
    "slug": "black-snake-head-sling-bag",
    "description": "Snake Head Sling Bag / Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Snake Head Sling Bag",
      "slug": "snake-head-sling-bag"
    },
    "colorway": "Black",
    "display_order": 43,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-059531.png"
    ]
  },
  {
    "name": "Black Wolven Messenger Bag",
    "slug": "black-wolven-messenger-bag",
    "description": "Wolven Messenger Bag / Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Wolven Messenger Bag",
      "slug": "wolven-messenger-bag"
    },
    "colorway": "Black",
    "display_order": 44,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-099621.png"
    ]
  },
  {
    "name": "Royale Fabric Holster",
    "slug": "royale-fabric-holster",
    "description": "Fabric Holster / Royale",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Fabric Holster",
      "slug": "fabric-holster"
    },
    "colorway": "Royale",
    "display_order": 45,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-0746821.png"
    ]
  },
  {
    "name": "Royale Snake Head Sling Bag",
    "slug": "royale-snake-head-sling-bag",
    "description": "Snake Head Sling Bag / Royale",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Snake Head Sling Bag",
      "slug": "snake-head-sling-bag"
    },
    "colorway": "Royale",
    "display_order": 46,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-097461.png"
    ]
  },
  {
    "name": "Multicam Black Wolven Messenger Bag",
    "slug": "multicam-black-wolven-messenger-bag",
    "description": "Wolven Messenger Bag / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Wolven Messenger Bag",
      "slug": "wolven-messenger-bag"
    },
    "colorway": "Multicam Black",
    "display_order": 47,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-065241.png"
    ]
  },
  {
    "name": "Black Rattle Belt",
    "slug": "black-rattle-belt",
    "description": "Rattle Belt / Black",
    "price": null,
    "regional_prices": {},
    "category": "belt",
    "series": {
      "name": "Rattle Belt",
      "slug": "rattle-belt"
    },
    "colorway": "Black",
    "display_order": 48,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-065171.png"
    ]
  },
  {
    "name": "Black Trojan Pro Warbelt",
    "slug": "black-trojan-pro-warbelt",
    "description": "Trojan Pro Warbelt / Black",
    "price": null,
    "regional_prices": {},
    "category": "belt",
    "series": {
      "name": "Trojan Pro Warbelt",
      "slug": "trojan-pro-warbelt"
    },
    "colorway": "Black",
    "display_order": 49,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-099741.png"
    ]
  },
  {
    "name": "Green Trojan Pro Warbelt",
    "slug": "green-trojan-pro-warbelt",
    "description": "Trojan Pro Warbelt / Green",
    "price": null,
    "regional_prices": {},
    "category": "belt",
    "series": {
      "name": "Trojan Pro Warbelt",
      "slug": "trojan-pro-warbelt"
    },
    "colorway": "Green",
    "display_order": 50,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-087031.png"
    ]
  },
  {
    "name": "Royale Trojan Pro Warbelt",
    "slug": "royale-trojan-pro-warbelt",
    "description": "Trojan Pro Warbelt / Royale",
    "price": null,
    "regional_prices": {},
    "category": "belt",
    "series": {
      "name": "Trojan Pro Warbelt",
      "slug": "trojan-pro-warbelt"
    },
    "colorway": "Royale",
    "display_order": 51,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-096201.png"
    ]
  },
  {
    "name": "Multicam Black Trojan Pro Warbelt",
    "slug": "multicam-black-trojan-pro-warbelt",
    "description": "Trojan Pro Warbelt / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "belt",
    "series": {
      "name": "Trojan Pro Warbelt",
      "slug": "trojan-pro-warbelt"
    },
    "colorway": "Multicam Black",
    "display_order": 52,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-065261.png"
    ]
  },
  {
    "name": "Tiger Stripe Camo Wolven Messenger Bag",
    "slug": "tiger-stripe-camo-wolven-messenger-bag",
    "description": "Wolven Messenger Bag / Tiger Stripe Camo",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Wolven Messenger Bag",
      "slug": "wolven-messenger-bag"
    },
    "colorway": "Tiger Stripe Camo",
    "display_order": 53,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-087601.png"
    ]
  },
  {
    "name": "Multicam Black Rattle Belt",
    "slug": "multicam-black-rattle-belt",
    "description": "Rattle Belt / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "belt",
    "series": {
      "name": "Rattle Belt",
      "slug": "rattle-belt"
    },
    "colorway": "Multicam Black",
    "display_order": 54,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-088891.png"
    ]
  },
  {
    "name": "Multicam Tropic Fabric Holster",
    "slug": "multicam-tropic-fabric-holster",
    "description": "Fabric Holster / Multicam Tropic",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Fabric Holster",
      "slug": "fabric-holster"
    },
    "colorway": "Multicam Tropic",
    "display_order": 55,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-089381.png"
    ]
  },
  {
    "name": "Multicam Tropic Rifle Mag Pouch",
    "slug": "multicam-tropic-rifle-mag-pouch",
    "description": "Rifle Mag Pouch / Multicam Tropic",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Rifle Mag Pouch",
      "slug": "rifle-mag-pouch"
    },
    "colorway": "Multicam Tropic",
    "display_order": 56,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-089591.png"
    ]
  },
  {
    "name": "Multicam Fabric Holster",
    "slug": "multicam-fabric-holster",
    "description": "Fabric Holster / Multicam",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Fabric Holster",
      "slug": "fabric-holster"
    },
    "colorway": "Multicam",
    "display_order": 57,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-089611.png"
    ]
  },
  {
    "name": "Multicam Rifle Mag Pouch",
    "slug": "multicam-rifle-mag-pouch",
    "description": "Rifle Mag Pouch / Multicam",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Rifle Mag Pouch",
      "slug": "rifle-mag-pouch"
    },
    "colorway": "Multicam",
    "display_order": 58,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-059951.png"
    ]
  },
  {
    "name": "Multicam Black Fabric Holster",
    "slug": "multicam-black-fabric-holster",
    "description": "Fabric Holster / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Fabric Holster",
      "slug": "fabric-holster"
    },
    "colorway": "Multicam Black",
    "display_order": 59,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-059821.png"
    ]
  },
  {
    "name": "Multicam Black Rifle Mag Pouch",
    "slug": "multicam-black-rifle-mag-pouch",
    "description": "Rifle Mag Pouch / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "accessories",
    "series": {
      "name": "Rifle Mag Pouch",
      "slug": "rifle-mag-pouch"
    },
    "colorway": "Multicam Black",
    "display_order": 60,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-060291.png"
    ]
  },
  {
    "name": "Multicam Black Snake Head Sling Bag",
    "slug": "multicam-black-snake-head-sling-bag",
    "description": "Snake Head Sling Bag / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Snake Head Sling Bag",
      "slug": "snake-head-sling-bag"
    },
    "colorway": "Multicam Black",
    "display_order": 61,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-099931.png"
    ]
  },
  {
    "name": "Multicam Black Chitto Mark 2",
    "slug": "multicam-black-chitto-mark-2",
    "description": "Chitto Series / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Chitto Series",
      "slug": "chitto-series"
    },
    "colorway": "Multicam Black",
    "display_order": 62,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-060101.png"
    ]
  },
  {
    "name": "Black Viper Kangguru",
    "slug": "black-viper-kangguru",
    "description": "Viper Series / Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Viper Series",
      "slug": "viper-series"
    },
    "colorway": "Black",
    "display_order": 63,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-099811.png"
    ]
  },
  {
    "name": "Multicam Black Thunder",
    "slug": "multicam-black-thunder",
    "description": "Thunder Chestrig Series / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Thunder Chestrig Series",
      "slug": "thunder-chestrig-series"
    },
    "colorway": "Multicam Black",
    "display_order": 64,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-060381.png"
    ]
  },
  {
    "name": "Multicam Black Aim Vortex",
    "slug": "multicam-black-aim-vortex",
    "description": "Aim Vortex Rifle Bag / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Aim Vortex Rifle Bag",
      "slug": "aim-vortex-rifle-bag"
    },
    "colorway": "Multicam Black",
    "display_order": 65,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-060681.png",
      "/storefront/figma/catalogue/open/gjh-060511.png"
    ]
  },
  {
    "name": "Royale Bite Bee",
    "slug": "royale-bite-bee",
    "description": "Bite Bee Handbag / Royale",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Bite Bee Handbag",
      "slug": "bite-bee-handbag"
    },
    "colorway": "Royale",
    "display_order": 67,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-060831.png"
    ]
  },
  {
    "name": "Green Cobra Backpack",
    "slug": "green-cobra-backpack",
    "description": "Cobra Backpack / Green",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Cobra Backpack",
      "slug": "cobra-backpack"
    },
    "colorway": "Green",
    "display_order": 68,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-099891.png"
    ]
  },
  {
    "name": "Multicam Black Dregon Head Backpack",
    "slug": "multicam-black-dregon-head-backpack",
    "description": "Dregon Head Backpack / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "pack",
    "series": {
      "name": "Dregon Head Backpack",
      "slug": "dregon-head-backpack"
    },
    "colorway": "Multicam Black",
    "display_order": 69,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-099761.png"
    ]
  },
  {
    "name": "Multicam Black Viper Kangguru",
    "slug": "multicam-black-viper-kangguru",
    "description": "Viper Series / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Viper Series",
      "slug": "viper-series"
    },
    "colorway": "Multicam Black",
    "display_order": 70,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-078841.png"
    ]
  },
  {
    "name": "King Viper Kangguru",
    "slug": "king-viper-kangguru",
    "description": "Viper Series / King",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Viper Series",
      "slug": "viper-series"
    },
    "colorway": "King",
    "display_order": 71,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-003981.png"
    ]
  },
  {
    "name": "Green Viper Kangguru",
    "slug": "green-viper-kangguru",
    "description": "Viper Series / Green",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Viper Series",
      "slug": "viper-series"
    },
    "colorway": "Green",
    "display_order": 72,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-090721.png"
    ]
  },
  {
    "name": "Green Cobra",
    "slug": "green-cobra",
    "description": "Cobra Series / Green",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Green",
    "display_order": 73,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-096321.png"
    ]
  },
  {
    "name": "Royal Cobra",
    "slug": "royal-cobra",
    "description": "Cobra Series / Royal",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Royal",
    "display_order": 74,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-096381.png"
    ]
  },
  {
    "name": "King Cobra",
    "slug": "king-cobra",
    "description": "Cobra Series / King",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "King",
    "display_order": 75,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-095841.png"
    ]
  },
  {
    "name": "Cobra Desert Night Camo",
    "slug": "cobra-desert-night-camo",
    "description": "Cobra Series / Desert Night Camo",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Desert Night Camo",
    "display_order": 76,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-055901.png"
    ]
  },
  {
    "name": "Cobra Tiger Stripe Camo",
    "slug": "cobra-tiger-stripe-camo",
    "description": "Cobra Series / Tiger Stripe Camo",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Tiger Stripe Camo",
    "display_order": 77,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-087311.png"
    ]
  },
  {
    "name": "Cobra Multicam Black",
    "slug": "cobra-multicam-black",
    "description": "Cobra Series / Multicam Black",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Multicam Black",
    "display_order": 78,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/gjh-097351.png"
    ]
  },
  {
    "name": "Cobra Multicam Tropic",
    "slug": "cobra-multicam-tropic",
    "description": "Cobra Series / Multicam Tropic",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Multicam Tropic",
    "display_order": 79,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-065791.png"
    ]
  },
  {
    "name": "Cobra Multicam",
    "slug": "cobra-multicam",
    "description": "Cobra Series / Multicam",
    "price": null,
    "regional_prices": {},
    "category": "vest",
    "series": {
      "name": "Cobra Series",
      "slug": "cobra-series"
    },
    "colorway": "Multicam",
    "display_order": 80,
    "specifications": [],
    "images": [
      "/storefront/figma/catalogue/open/dsc-086121.png"
    ]
  }
];
