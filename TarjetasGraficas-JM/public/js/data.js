// data.js — Base de datos local de GPUs para GPU Hub
// Contiene 130 GPUs reales con datos coherentes y listos para usar.

const gpuData = [
    
    // ============================
    //   EDICIONES ESPECIALES
    // ============================

    {
        id: "rtx5090matrixplatinum",
        name: "NVIDIA GeForce RTX 5090 Matrix Platinum Edition",
        vram: "48 GB GDDR7",
        performanceScore: 110,
        price: 2999,
        powerWatts: 450,
        recommendedPsu: 750,
        image: "img/EDICIONES ESPECIALES/rtx5090matrixplatinum.png"
    },
    {
        id: "rtx5080miku",
        name: "NVIDIA GeForce RTX 5080 Hatsune Miku Edition",
        vram: "24 GB GDDR7",
        performanceScore: 92,
        price: 1199,
        powerWatts: 320,
        recommendedPsu: 750,
        image: "img/EDICIONES ESPECIALES/rtx5080miku.png"
    },
    {
        id: "rtx4070wow",
        name: "NVIDIA GeForce RTX 4070 WoW Edition",
        vram: "12 GB GDDR6X",
        performanceScore: 85,
        price: 899,
        powerWatts: 285,
        recommendedPsu: 750,
        image: "img/EDICIONES ESPECIALES/rtx4070wow.png"
    },
    
    { id: "rtx3070spiderman", 
        name: "NVIDIA GeForce RTX 3070 Spider-Man Edition", 
        vram: "8 GB GDDR6", 
        performanceScore: 78, 
        price: 699, 
        powerWatts: 220, 
        recommendedPsu: 650, 
        image: "img/EDICIONES ESPECIALES/rtx3070spiderman.png" }, 
    
    { 
        id: "rtx3080eva01", 
        name: "NVIDIA GeForce RTX 3080 Evangelion EVA-01 Edition", 
        vram: "10 GB GDDR6X", 
        performanceScore: 88, 
        price: 899, 
        powerWatts: 320, 
        recommendedPsu: 750, 
        image: "img/EDICIONES ESPECIALES/rtx3080eva01.png" }, 
    
    { 
        id: "rtx4090eva02", 
        name: "NVIDIA GeForce RTX 4090 Evangelion EVA-02 Edition", 
        vram: "24 GB GDDR6X", 
        performanceScore: 105, 
        price: 1799, 
        powerWatts: 450, 
        recommendedPsu: 850, 
        image: "img/EDICIONES ESPECIALES/rtx4090eva02.png" 
    }, 

    { 
        id: "rtx4090neptune", 
        name: "NVIDIA GeForce RTX 4090 Neptune Edition", 
        vram: "24 GB GDDR6X", 
        performanceScore: 108, 
        price: 1899, 
        powerWatts: 480, 
        recommendedPsu: 850, 
        image: "img/EDICIONES ESPECIALES/rtx4090neptune.png" 
    }, 
    
    { 
        id: "rx7900xtxhellhoundspectral", 
        name: "AMD Radeon RX 7900 XTX Hellhound Edition", 
        vram: "24 GB GDDR6", 
        performanceScore: 95, 
        price: 999, 
        powerWatts: 355, 
        recommendedPsu: 750, 
        image: "img/EDICIONES ESPECIALES/rx7900xtxhellhoundspectral.png" 
    }, 
    
    { 
        id: "rx9070xtmonsterhunter", 
        name: "AMD Radeon RX 9070 XT Monster Hunter Edition", 
        vram: "32 GB GDDR6", 
        performanceScore: 102, 
        price: 1299, 
        powerWatts: 390, 
        recommendedPsu: 800, 
        image: "img/EDICIONES ESPECIALES/rx9070xtmonsterhunter.png" 
    },

    // ============================
    //   NVIDIA RTX 50 SERIES
    // ============================

    {
        id: "rtx5090",
        name: "NVIDIA GeForce RTX 5090",
        vram: "32 GB GDDR7",
        performanceScore: 100,
        price: 1999,
        powerWatts: 450,
        recommendedPsu: 850,
        image: "img/NVIDIA RTX 50 SERIES/rtx5090.png"
    },
    {
        id: "rtx5080",
        name: "NVIDIA GeForce RTX 5080",
        vram: "24 GB GDDR7",
        performanceScore: 92,
        price: 999,
        powerWatts: 320,
        recommendedPsu: 750,
        image: "img/NVIDIA RTX 50 SERIES/rtx5080.png"
    },
    {
        id: "rtx5070ti",
        name: "NVIDIA GeForce RTX 5070 Ti",
        vram: "20 GB GDDR7",
        performanceScore: 85,
        price: 699,
        powerWatts: 260,
        recommendedPsu: 650,
        image: "img/NVIDIA RTX 50 SERIES/rtx5070ti.png"
    },
    {
        id: "rtx5070",
        name: "NVIDIA GeForce RTX 5070",
        vram: "16 GB GDDR7",
        performanceScore: 78,
        price: 549,
        powerWatts: 220,
        recommendedPsu: 600,
        image: "img/NVIDIA RTX 50 SERIES/rtx5070.png"
    },
    {
        id: "rtx5060ti",
        name: "NVIDIA GeForce RTX 5060 Ti",
        vram: "16 GB GDDR7",
        performanceScore: 65,
        price: 399,
        powerWatts: 180,
        recommendedPsu: 550,
        image: "img/NVIDIA RTX 50 SERIES/rtx5060ti.png"
    },
    {
        id: "rtx5060",
        name: "NVIDIA GeForce RTX 5060",
        vram: "12 GB GDDR7",
        performanceScore: 58,
        price: 319,
        powerWatts: 160,
        recommendedPsu: 500,
        image: "img/NVIDIA RTX 50 SERIES/rtx5060.png"
    },
    {
        id: "rtx5050",
        name: "NVIDIA GeForce RTX 5050",
        vram: "8 GB GDDR7",
        performanceScore: 42,
        price: 249,
        powerWatts: 130,
        recommendedPsu: 450,
        image: "img/NVIDIA RTX 50 SERIES/rtx5050.png"
    },


    // ============================
    //   NVIDIA RTX 40 SERIES
    // ============================

    {
        id: "rtx4090",
        name: "NVIDIA GeForce RTX 4090",
        vram: "24 GB GDDR6X",
        performanceScore: 100,
        price: 1999,
        powerWatts: 450,
        recommendedPsu: 850,
        image: "img/NVIDIA RTX 40 SERIES/rtx4090.png"
    },
    {
        id: "rtx4080",
        name: "NVIDIA GeForce RTX 4080",
        vram: "16 GB GDDR6X",
        performanceScore: 92,
        price: 1299,
        powerWatts: 320,
        recommendedPsu: 750,
        image: "img/NVIDIA RTX 40 SERIES/rtx4080.png"
    },
    {
        id: "rtx4070ti",
        name: "NVIDIA GeForce RTX 4070 Ti",
        vram: "12 GB GDDR6X",
        performanceScore: 85,
        price: 899,
        powerWatts: 285,
        recommendedPsu: 700,
        image: "img/NVIDIA RTX 40 SERIES/rtx4070ti.png"
    },
    {
        id: "rtx4070",
        name: "NVIDIA GeForce RTX 4070",
        vram: "12 GB GDDR6X",
        performanceScore: 78,
        price: 599,
        powerWatts: 200,
        recommendedPsu: 650,
        image: "img/NVIDIA RTX 40 SERIES/rtx4070.png"
    },
    {
        id: "rtx4060ti",
        name: "NVIDIA GeForce RTX 4060 Ti",
        vram: "8 GB GDDR6",
        performanceScore: 70,
        price: 399,
        powerWatts: 160,
        recommendedPsu: 550,
        image: "img/NVIDIA RTX 40 SERIES/rtx4060ti.png"
    },
    {
        id: "rtx4060",
        name: "NVIDIA GeForce RTX 4060",
        vram: "8 GB GDDR6",
        performanceScore: 62,
        price: 299,
        powerWatts: 115,
        recommendedPsu: 500,
        image: "img/NVIDIA RTX 40 SERIES/rtx4060.png"
    },
    {
        id: "rtx4050",
        name: "NVIDIA GeForce RTX 4050",
        vram: "6 GB GDDR6",
        performanceScore: 50,
        price: 249,
        powerWatts: 95,
        recommendedPsu: 450,
        image: "img/NVIDIA RTX 40 SERIES/rtx4050.png"
    },

    // ============================
    //   NVIDIA RTX 30 SERIES
    // ============================

    {
        id: "rtx3090",
        name: "NVIDIA GeForce RTX 3090",
        vram: "24 GB GDDR6X",
        performanceScore: 90,
        price: 1499,
        powerWatts: 350,
        recommendedPsu: 750,
        image: "img/NVIDIA RTX 30 SERIES/rtx3090.png"
    },
    {
        id: "rtx3080",
        name: "NVIDIA GeForce RTX 3080",
        vram: "10 GB GDDR6X",
        performanceScore: 82,
        price: 699,
        powerWatts: 320,
        recommendedPsu: 750,
        image: "img/NVIDIA RTX 30 SERIES/rtx3080.png"
    },
        {
        id: "rtx3070ti",
        name: "NVIDIA GeForce RTX 3070 Ti",
        vram: "8 GB GDDR6",
        performanceScore: 76,
        price: 599,
        powerWatts: 250,
        recommendedPsu: 650,
        image: "img/NVIDIA RTX 30 SERIES/rtx3070ti.png"
    },
    {
        id: "rtx3070",
        name: "NVIDIA GeForce RTX 3070",
        vram: "8 GB GDDR6",
        performanceScore: 74,
        price: 499,
        powerWatts: 220,
        recommendedPsu: 650,
        image: "img/NVIDIA RTX 30 SERIES/rtx3070.png"
    },
    {
        id: "rtx3060ti",
        name: "NVIDIA GeForce RTX 3060 Ti",
        vram: "8 GB GDDR6",
        performanceScore: 68,
        price: 399,
        powerWatts: 200,
        recommendedPsu: 600,
        image: "img/NVIDIA RTX 30 SERIES/rtx3060ti.png"
    },
    {
        id: "rtx3060",
        name: "NVIDIA GeForce RTX 3060",
        vram: "12 GB GDDR6",
        performanceScore: 60,
        price: 329,
        powerWatts: 170,
        recommendedPsu: 550,
        image: "img/NVIDIA RTX 30 SERIES/rtx3060.png"
    },
    {
        id: "rtx3050",
        name: "NVIDIA GeForce RTX 3050",
        vram: "8 GB GDDR6",
        performanceScore: 48,
        price: 249,
        powerWatts: 130,
        recommendedPsu: 500,
        image: "img/NVIDIA RTX 30 SERIES/rtx3050.png"
    },

    // ============================
    //   AMD RX 7000 SERIES
    // ============================

    {
        id: "rx7900xtx",
        name: "AMD Radeon RX 7900 XTX",
        vram: "24 GB GDDR6",
        performanceScore: 95,
        price: 999,
        powerWatts: 355,
        recommendedPsu: 800,
        image: "img/AMD RX 7000 SERIES/rx7900xtx.png"
    },
    {
        id: "rx7900xt",
        name: "AMD Radeon RX 7900 XT",
        vram: "20 GB GDDR6",
        performanceScore: 88,
        price: 899,
        powerWatts: 300,
        recommendedPsu: 750,
        image: "img/AMD RX 7000 SERIES/rx7900xt.png"
    },
    {
        id: "rx7800xt",
        name: "AMD Radeon RX 7800 XT",
        vram: "16 GB GDDR6",
        performanceScore: 80,
        price: 499,
        powerWatts: 263,
        recommendedPsu: 700,
        image: "img/AMD RX 7000 SERIES/rx7800xt.png"
    },
    {
        id: "rx7700xt",
        name: "AMD Radeon RX 7700 XT",
        vram: "12 GB GDDR6",
        performanceScore: 72,
        price: 449,
        powerWatts: 245,
        recommendedPsu: 650,
        image: "img/AMD RX 7000 SERIES/rx7700xt.png"
    },
    {
        id: "rx7600",
        name: "AMD Radeon RX 7600",
        vram: "8 GB GDDR6",
        performanceScore: 63,
        price: 269,
        powerWatts: 165,
        recommendedPsu: 550,
        image: "img/AMD RX 7000 SERIES/rx7600.png"
    },

    // ============================
    //   AMD RX 6000 SERIES
    // ============================

    {
        id: "rx6950xt",
        name: "AMD Radeon RX 6950 XT",
        vram: "16 GB GDDR6",
        performanceScore: 85,
        price: 699,
        powerWatts: 335,
        recommendedPsu: 750,
        image: "img/AMD RX 6000 SERIES/rx6950xt.png"
    },
    {
        id: "rx6900xt",
        name: "AMD Radeon RX 6900 XT",
        vram: "16 GB GDDR6",
        performanceScore: 82,
        price: 599,
        powerWatts: 300,
        recommendedPsu: 700,
        image: "img/AMD RX 6000 SERIES/rx6900xt.png"
    },
    {
        id: "rx6800xt",
        name: "AMD Radeon RX 6800 XT",
        vram: "16 GB GDDR6",
        performanceScore: 78,
        price: 549,
        powerWatts: 300,
        recommendedPsu: 700,
        image: "img/AMD RX 6000 SERIES/rx6800xt.png"
    },
    {
        id: "rx6800",
        name: "AMD Radeon RX 6800",
        vram: "16 GB GDDR6",
        performanceScore: 74,
        price: 499,
        powerWatts: 250,
        recommendedPsu: 650,
        image: "img/AMD RX 6000 SERIES/rx6800.png"
    },
    {
        id: "rx6700xt",
        name: "AMD Radeon RX 6700 XT",
        vram: "12 GB GDDR6",
        performanceScore: 68,
        price: 399,
        powerWatts: 230,
        recommendedPsu: 600,
        image: "img/AMD RX 6000 SERIES/rx6700xt.png"
    },
    {
        id: "rx6700",
        name: "AMD Radeon RX 6700",
        vram: "10 GB GDDR6",
        performanceScore: 62,
        price: 349,
        powerWatts: 175,
        recommendedPsu: 550,
        image: "img/AMD RX 6000 SERIES/rx6700.png"
    },
    {
        id: "rx6600xt",
        name: "AMD Radeon RX 6600 XT",
        vram: "8 GB GDDR6",
        performanceScore: 58,
        price: 329,
        powerWatts: 160,
        recommendedPsu: 500,
        image: "img/AMD RX 6000 SERIES/rx6600xt.png"
    },
    {
        id: "rx6600",
        name: "AMD Radeon RX 6600",
        vram: "8 GB GDDR6",
        performanceScore: 54,
        price: 299,
        powerWatts: 132,
        recommendedPsu: 500,
        image: "img/AMD RX 6000 SERIES/rx6600.png"
    },
    {
        id: "rx6500xt",
        name: "AMD Radeon RX 6500 XT",
        vram: "4 GB GDDR6",
        performanceScore: 40,
        price: 199,
        powerWatts: 107,
        recommendedPsu: 450,
        image: "img/AMD RX 6000 SERIES/rx6500xt.png"
    },
    {
        id: "rx6400",
        name: "AMD Radeon RX 6400",
        vram: "4 GB GDDR6",
        performanceScore: 35,
        price: 159,
        powerWatts: 53,
        recommendedPsu: 400,
        image: "img/AMD RX 6000 SERIES/rx6400.png"
    },

    // ============================
    //   SUPERPOTENTES E HIPERPOTENTES
    // ============================

    {
        id: "rtx_titan_v",
        name: "NVIDIA TITAN V",
        vram: "12 GB HBM2",
        performanceScore: 120,
        price: 2999,
        powerWatts: 250,
        recommendedPsu: 650,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/rtxtitanv.png"
    },
    {
        id: "rtx_titan_rtx",
        name: "NVIDIA TITAN RTX",
        vram: "24 GB GDDR6",
        performanceScore: 130,
        price: 2499,
        powerWatts: 280,
        recommendedPsu: 650,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/rtxtitanrtx.png"
    },
    {
        id: "quadro_rtx_8000",
        name: "NVIDIA Quadro RTX 8000",
        vram: "48 GB GDDR6",
        performanceScore: 140,
        price: 5999,
        powerWatts: 295,
        recommendedPsu: 750,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/quadrortx8000.png"
    },
    {
        id: "quadro_rtx_6000",
        name: "NVIDIA Quadro RTX 6000",
        vram: "24 GB GDDR6",
        performanceScore: 125,
        price: 3999,
        powerWatts: 295,
        recommendedPsu: 750,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/quadrortx6000.png"
    },
    {
        id: "rtx_a6000",
        name: "NVIDIA RTX A6000",
        vram: "48 GB GDDR6",
        performanceScore: 150,
        price: 4999,
        powerWatts: 300,
        recommendedPsu: 750,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/rtxa6000.png"
    },
    {
        id: "rtx_a5000",
        name: "NVIDIA RTX A5000",
        vram: "24 GB GDDR6",
        performanceScore: 115,
        price: 2499,
        powerWatts: 230,
        recommendedPsu: 650,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/rtxa5000.png"
    },
    {
        id: "h100_pcie",
        name: "NVIDIA H100 PCIe",
        vram: "80 GB HBM3",
        performanceScore: 300,
        price: 30000,
        powerWatts: 350,
        recommendedPsu: 1000,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/h100pcie.png"
    },
    {
        id: "a100_pcie",
        name: "NVIDIA A100 PCIe",
        vram: "40 GB HBM2e",
        performanceScore: 220,
        price: 15000,
        powerWatts: 250,
        recommendedPsu: 850,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/a100pcie.png"
    },
    {
        id: "amd_instinct_mi250",
        name: "AMD Instinct MI250",
        vram: "128 GB HBM2e",
        performanceScore: 260,
        price: 18000,
        powerWatts: 500,
        recommendedPsu: 1200,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/mi250.png"
    },
    {
        id: "radeon_pro_w6800",
        name: "AMD Radeon Pro W6800",
        vram: "32 GB GDDR6",
        performanceScore: 110,
        price: 2499,
        powerWatts: 250,
        recommendedPsu: 650,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/radeonprow6800.png"
    },
    {
        id: "radeon_pro_vii",
        name: "AMD Radeon Pro VII",
        vram: "16 GB HBM2",
        performanceScore: 105,
        price: 1899,
        powerWatts: 250,
        recommendedPsu: 650,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/radeonprovii.png"
    },
    {
        id: "amd_instinct_mi100",
        name: "AMD Instinct MI100",
        vram: "32 GB HBM2",
        performanceScore: 180,
        price: 12000,
        powerWatts: 300,
        recommendedPsu: 850,
        image: "img/SUPERPOTENTES E HIPERPOTENTES/mi100.png"
    },

    // ============================
    //   INTEL ARC SERIES
    // ============================

    {
        id: "intel_arc_a770",
        name: "Intel Arc A770",
        vram: "16 GB GDDR6",
        performanceScore: 72,
        price: 349,
        powerWatts: 225,
        recommendedPsu: 600,
        image: "img/INTEL ARC SERIES/intelarca770.png"
    },
    {
        id: "intel_arc_a750",
        name: "Intel Arc A750",
        vram: "8 GB GDDR6",
        performanceScore: 63,
        price: 249,
        powerWatts: 225,
        recommendedPsu: 600,
        image: "img/INTEL ARC SERIES/intelarca750.png"
    },
    {
        id: "intel_arc_a580",
        name: "Intel Arc A580",
        vram: "8 GB GDDR6",
        performanceScore: 55,
        price: 179,
        powerWatts: 185,
        recommendedPsu: 550,
        image: "img/INTEL ARC SERIES/intelarca580.png"
    },
    {
        id: "intel_arc_a380",
        name: "Intel Arc A380",
        vram: "6 GB GDDR6",
        performanceScore: 38,
        price: 129,
        powerWatts: 75,
        recommendedPsu: 450,
        image: "img/INTEL ARC SERIES/intelarca380.png"
    },
    {
        id: "intel_arc_a310",
        name: "Intel Arc A310",
        vram: "4 GB GDDR6",
        performanceScore: 22,
        price: 99,
        powerWatts: 75,
        recommendedPsu: 400,
        image: "img/INTEL ARC SERIES/intelarca310.png"
    },
    {
        id: "intel_arc_pro_a60",
        name: "Intel Arc Pro A60",
        vram: "12 GB GDDR6",
        performanceScore: 48,
        price: 249,
        powerWatts: 130,
        recommendedPsu: 450,
        image: "img/INTEL ARC SERIES/intelarcproa60.png"
    },
    {
        id: "intel_arc_pro_a50",
        name: "Intel Arc Pro A50",
        vram: "8 GB GDDR6",
        performanceScore: 41,
        price: 199,
        powerWatts: 90,
        recommendedPsu: 400,
        image: "img/INTEL ARC SERIES/intelarcproa50.png"
    },
    {
        id: "intel_arc_pro_a40",
        name: "Intel Arc Pro A40",
        vram: "6 GB GDDR6",
        performanceScore: 35,
        price: 169,
        powerWatts: 75,
        recommendedPsu: 350,
        image: "img/INTEL ARC SERIES/intelarcproa40.png"
    },

    // ============================
    //   NVIDIA — GTX 1000 / 900 / 700 / 600 / 500 / 400 / 200 / FX
    // ============================

    {
        id: "gtx1080ti",
        name: "NVIDIA GeForce GTX 1080 Ti",
        vram: "11 GB GDDR5X",
        performanceScore: 62,
        price: 699,
        powerWatts: 250,
        recommendedPsu: 600,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx1080ti.png"
    },
    {
        id: "gtx1080",
        name: "NVIDIA GeForce GTX 1080",
        vram: "8 GB GDDR5X",
        performanceScore: 55,
        price: 599,
        powerWatts: 180,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx1080.png"
    },
    {
        id: "gtx1070",
        name: "NVIDIA GeForce GTX 1070",
        vram: "8 GB GDDR5",
        performanceScore: 48,
        price: 379,
        powerWatts: 150,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx1070.png"
    },
    {
        id: "gtx1060",
        name: "NVIDIA GeForce GTX 1060",
        vram: "6 GB GDDR5",
        performanceScore: 32,
        price: 249,
        powerWatts: 120,
        recommendedPsu: 450,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx1060.png"
    },
    {
        id: "gtx1050ti",
        name: "NVIDIA GeForce GTX 1050 Ti",
        vram: "4 GB GDDR5",
        performanceScore: 18,
        price: 139,
        powerWatts: 75,
        recommendedPsu: 350,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx1050ti.png"
    },
    {
        id: "gtx980ti",
        name: "NVIDIA GeForce GTX 980 Ti",
        vram: "6 GB GDDR5",
        performanceScore: 45,
        price: 649,
        powerWatts: 250,
        recommendedPsu: 600,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx980ti.png"
    },
    {
        id: "gtx970",
        name: "NVIDIA GeForce GTX 970",
        vram: "4 GB GDDR5",
        performanceScore: 35,
        price: 329,
        powerWatts: 145,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx970.png"
    },
    {
        id: "gtx960",
        name: "NVIDIA GeForce GTX 960",
        vram: "2 GB GDDR5",
        performanceScore: 22,
        price: 199,
        powerWatts: 120,
        recommendedPsu: 450,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx960.png"
    },
    {
        id: "gtx950",
        name: "NVIDIA GeForce GTX 950",
        vram: "2 GB GDDR5",
        performanceScore: 17,
        price: 159,
        powerWatts: 90,
        recommendedPsu: 350,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx950.png"
    },
    {
        id: "gtx780ti",
        name: "NVIDIA GeForce GTX 780 Ti",
        vram: "3 GB GDDR5",
        performanceScore: 32,
        price: 699,
        powerWatts: 250,
        recommendedPsu: 600,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx780ti.png"
    },
    {
        id: "gtx770",
        name: "NVIDIA GeForce GTX 770",
        vram: "2 GB GDDR5",
        performanceScore: 20,
        price: 249,
        powerWatts: 230,
        recommendedPsu: 550,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx770.png"
    },
    {
        id: "gtx760",
        name: "NVIDIA GeForce GTX 760",
        vram: "2 GB GDDR5",
        performanceScore: 17,
        price: 199,
        powerWatts: 170,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx760.png"
    },
    {
        id: "gtx750ti",
        name: "NVIDIA GeForce GTX 750 Ti",
        vram: "2 GB GDDR5",
        performanceScore: 12,
        price: 149,
        powerWatts: 60,
        recommendedPsu: 350,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx750ti.png"
    },
    {
        id: "gtx680",
        name: "NVIDIA GeForce GTX 680",
        vram: "2 GB GDDR5",
        performanceScore: 19,
        price: 499,
        powerWatts: 195,
        recommendedPsu: 550,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx680.png"
    },
    {
        id: "gtx670",
        name: "NVIDIA GeForce GTX 670",
        vram: "2 GB GDDR5",
        performanceScore: 17,
        price: 399,
        powerWatts: 170,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx670.png"
    },
    {
        id: "gtx660",
        name: "NVIDIA GeForce GTX 660",
        vram: "2 GB GDDR5",
        performanceScore: 14,
        price: 229,
        powerWatts: 140,
        recommendedPsu: 450,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx660.png"
    },
    {
        id: "gtx580",
        name: "NVIDIA GeForce GTX 580",
        vram: "1.5 GB GDDR5",
        performanceScore: 16,
        price: 499,
        powerWatts: 244,
        recommendedPsu: 600,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx580.png"
    },
    {
        id: "gtx570",
        name: "NVIDIA GeForce GTX 570",
        vram: "1.25 GB GDDR5",
        performanceScore: 14,
        price: 349,
        powerWatts: 219,
        recommendedPsu: 550,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx570.png"
    },
    {
        id: "gtx560ti",
        name: "NVIDIA GeForce GTX 560 Ti",
        vram: "1 GB GDDR5",
        performanceScore: 12,
        price: 249,
        powerWatts: 170,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx560ti.png"
    },
    {
        id: "gtx480",
        name: "NVIDIA GeForce GTX 480",
        vram: "1.5 GB GDDR5",
        performanceScore: 13,
        price: 499,
        powerWatts: 250,
        recommendedPsu: 600,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx480.png"
    },
    {
        id: "gtx470",
        name: "NVIDIA GeForce GTX 470",
        vram: "1.25 GB GDDR5",
        performanceScore: 11,
        price: 349,
        powerWatts: 215,
        recommendedPsu: 550,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx470.png"
    },
    {
        id: "gtx460",
        name: "NVIDIA GeForce GTX 460",
        vram: "1 GB GDDR5",
        performanceScore: 10,
        price: 199,
        powerWatts: 160,
        recommendedPsu: 450,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx460.png"
    },
    {
        id: "gtx285",
        name: "NVIDIA GeForce GTX 285",
        vram: "1 GB GDDR3",
        performanceScore: 8,
        price: 359,
        powerWatts: 204,
        recommendedPsu: 550,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx285.png"
    },
    {
        id: "gtx260",
        name: "NVIDIA GeForce GTX 260 SUPER",
        vram: "1.25 GB GDDR3",
        performanceScore: 7,
        price: 299,
        powerWatts: 182,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx260oc.png"
    },
    {
        id: "gtx260",
        name: "NVIDIA GeForce GTX 260",
        vram: "896 MB GDDR3",
        performanceScore: 7,
        price: 299,
        powerWatts: 182,
        recommendedPsu: 500,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/gtx260.png"
    },
    {
        id: "geforce_fx_5900",
        name: "NVIDIA GeForce FX 5900 Ultra",
        vram: "256 MB DDR",
        performanceScore: 3,
        price: 499,
        powerWatts: 75,
        recommendedPsu: 300,
        image: "img/NVIDIA — GTX 1000  900  700  600  500  400  200  FX/geforcefx5900.png"
    },

    // ============================
    //   AMD — RADEON HD / R9 / R7 / VEGA / FURY
    // ============================

    {
        id: "r9_290x",
        name: "AMD Radeon R9 290X",
        vram: "4 GB GDDR5",
        performanceScore: 28,
        price: 549,
        powerWatts: 290,
        recommendedPsu: 650,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r9290x.png"
    },
    {
        id: "r9_290",
        name: "AMD Radeon R9 290",
        vram: "4 GB GDDR5",
        performanceScore: 25,
        price: 399,
        powerWatts: 275,
        recommendedPsu: 600,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r9290.png"
    },
    {
        id: "r9_280x",
        name: "AMD Radeon R9 280X",
        vram: "3 GB GDDR5",
        performanceScore: 20,
        price: 299,
        powerWatts: 250,
        recommendedPsu: 600,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r9280x.png"
    },
    {
        id: "r9_270x",
        name: "AMD Radeon R9 270X",
        vram: "2 GB GDDR5",
        performanceScore: 14,
        price: 199,
        powerWatts: 180,
        recommendedPsu: 500,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r9270x.png"
    },
    {
        id: "r7_370",
        name: "AMD Radeon R7 370",
        vram: "2 GB GDDR5",
        performanceScore: 11,
        price: 149,
        powerWatts: 110,
        recommendedPsu: 450,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r7370.png"
    },
    {
        id: "r7_260x",
        name: "AMD Radeon R7 260X",
        vram: "2 GB GDDR5",
        performanceScore: 9,
        price: 129,
        powerWatts: 115,
        recommendedPsu: 450,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r7260x.png"
    },
    {
        id: "hd_7970",
        name: "AMD Radeon HD 7970",
        vram: "3 GB GDDR5",
        performanceScore: 18,
        price: 549,
        powerWatts: 250,
        recommendedPsu: 600,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd7970.png"
    },
    {
        id: "hd_7950",
        name: "AMD Radeon HD 7950",
        vram: "3 GB GDDR5",
        performanceScore: 15,
        price: 399,
        powerWatts: 200,
        recommendedPsu: 500,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd7950.png"
    },
    {
        id: "hd_7870",
        name: "AMD Radeon HD 7870",
        vram: "2 GB GDDR5",
        performanceScore: 13,
        price: 249,
        powerWatts: 175,
        recommendedPsu: 450,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd7870.png"
    },
    {
        id: "hd_7850",
        name: "AMD Radeon HD 7850",
        vram: "2 GB GDDR5",
        performanceScore: 11,
        price: 199,
        powerWatts: 130,
        recommendedPsu: 450,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd7850.png"
    },
    {
        id: "hd_6970",
        name: "AMD Radeon HD 6970",
        vram: "2 GB GDDR5",
        performanceScore: 12,
        price: 369,
        powerWatts: 250,
        recommendedPsu: 600,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd6970.png"
    },
    {
        id: "hd_6950",
        name: "AMD Radeon HD 6950",
        vram: "2 GB GDDR5",
        performanceScore: 10,
        price: 299,
        powerWatts: 200,
        recommendedPsu: 500,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd6950.png"
    },
    {
        id: "hd_6870",
        name: "AMD Radeon HD 6870",
        vram: "1 GB GDDR5",
        performanceScore: 9,
        price: 239,
        powerWatts: 151,
        recommendedPsu: 450,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd6870.png"
    },
    {
        id: "hd_6850",
        name: "AMD Radeon HD 6850",
        vram: "1 GB GDDR5",
        performanceScore: 8,
        price: 179,
        powerWatts: 127,
        recommendedPsu: 450,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/hd6850.png"
    },
    {
        id: "vega64",
        name: "AMD Radeon RX Vega 64",
        vram: "8 GB HBM2",
        performanceScore: 30,
        price: 499,
        powerWatts: 295,
        recommendedPsu: 650,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/vega64.png"
    },
    {
        id: "vega56",
        name: "AMD Radeon RX Vega 56",
        vram: "8 GB HBM2",
        performanceScore: 26,
        price: 399,
        powerWatts: 210,
        recommendedPsu: 600,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/vega56.png"
    },
    {
        id: "furyx",
        name: "AMD Radeon R9 Fury X",
        vram: "4 GB HBM",
        performanceScore: 24,
        price: 649,
        powerWatts: 275,
        recommendedPsu: 650,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/furyx.png"
    },
    {
        id: "fury",
        name: "AMD Radeon R9 Fury",
        vram: "4 GB HBM",
        performanceScore: 22,
        price: 549,
        powerWatts: 275,
        recommendedPsu: 650,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/fury.png"
    },
    {
        id: "r9_380",
        name: "AMD Radeon R9 380",
        vram: "4 GB GDDR5",
        performanceScore: 13,
        price: 199,
        powerWatts: 190,
        recommendedPsu: 500,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r9380.png"
    },
    {
        id: "r9_285",
        name: "AMD Radeon R9 285",
        vram: "2 GB GDDR5",
        performanceScore: 12,
        price: 249,
        powerWatts: 190,
        recommendedPsu: 500,
        image: "img/AMD — RADEON HD  R9  R7  VEGA  FURY/r9285.png"
    },


    // ============================
    //   NVIDIA (2005–2015)
    // ============================

    {
        id: "gtx295",
        name: "NVIDIA GeForce GTX 295",
        vram: "1.8 GB GDDR3",
        performanceScore: 9,
        price: 499,
        powerWatts: 289,
        recommendedPsu: 650,
        image: "img/NVIDIA (2005–2015)/gtx295.png"
    },
    {
        id: "gtx275",
        name: "NVIDIA GeForce GTX 275",
        vram: "896 MB GDDR3",
        performanceScore: 8,
        price: 249,
        powerWatts: 219,
        recommendedPsu: 550,
        image: "img/NVIDIA (2005–2015)/gtx275.png"
    },
    {
        id: "gtx260core216",
        name: "NVIDIA GeForce GTX 260 Core 216",
        vram: "896 MB GDDR3",
        performanceScore: 7,
        price: 199,
        powerWatts: 182,
        recommendedPsu: 500,
        image: "img/NVIDIA (2005–2015)/gtx260core216.png"
    },
    {
        id: "gtx250",
        name: "NVIDIA GeForce GTS 250",
        vram: "1 GB GDDR3",
        performanceScore: 6,
        price: 149,
        powerWatts: 150,
        recommendedPsu: 450,
        image: "img/NVIDIA (2005–2015)/gts250.png"
    },
    {
        id: "gtx9800gtx",
        name: "NVIDIA GeForce 9800 GTX",
        vram: "512 MB GDDR3",
        performanceScore: 6,
        price: 299,
        powerWatts: 156,
        recommendedPsu: 450,
        image: "img/NVIDIA (2005–2015)/9800gtx.png"
    },
    {
        id: "gtx9800gt",
        name: "NVIDIA GeForce 9800 GT",
        vram: "512 MB GDDR3",
        performanceScore: 5,
        price: 199,
        powerWatts: 105,
        recommendedPsu: 400,
        image: "img/NVIDIA (2005–2015)/9800gt.png"
    },
    {
        id: "gtx9600gt",
        name: "NVIDIA GeForce 9600 GT",
        vram: "512 MB GDDR3",
        performanceScore: 4,
        price: 149,
        powerWatts: 95,
        recommendedPsu: 350,
        image: "img/NVIDIA (2005–2015)/9600gt.png"
    },
    {
        id: "gtx8800ultra",
        name: "NVIDIA GeForce 8800 Ultra",
        vram: "768 MB GDDR3",
        performanceScore: 7,
        price: 599,
        powerWatts: 175,
        recommendedPsu: 500,
        image: "img/NVIDIA (2005–2015)/8800ultra.png"
    },
    {
        id: "gtx8800gtx",
        name: "NVIDIA GeForce 8800 GTX",
        vram: "768 MB GDDR3",
        performanceScore: 6,
        price: 499,
        powerWatts: 155,
        recommendedPsu: 450,
        image: "img/NVIDIA (2005–2015)/8800gtx.png"
    },
    {
        id: "gtx8800gts",
        name: "NVIDIA GeForce 8800 GTS",
        vram: "640 MB GDDR3",
        performanceScore: 5,
        price: 399,
        powerWatts: 145,
        recommendedPsu: 450,
        image: "img/NVIDIA (2005–2015)/8800gts.png"
    },
    {
        id: "gtx8600gts",
        name: "NVIDIA GeForce 8600 GTS",
        vram: "256 MB GDDR3",
        performanceScore: 3,
        price: 199,
        powerWatts: 71,
        recommendedPsu: 300,
        image: "img/NVIDIA (2005–2015)/8600gts.png"
    },
    {
        id: "gtx7900gtx",
        name: "NVIDIA GeForce 7900 GTX",
        vram: "512 MB GDDR3",
        performanceScore: 4,
        price: 499,
        powerWatts: 84,
        recommendedPsu: 350,
        image: "img/NVIDIA (2005–2015)/7900gtx.png"
    },
    {
        id: "gtx7800gtx",
        name: "NVIDIA GeForce 7800 GTX",
        vram: "256 MB GDDR3",
        performanceScore: 3,
        price: 449,
        powerWatts: 100,
        recommendedPsu: 350,
        image: "img/NVIDIA (2005–2015)/7800gtx.png"
    },
    {
        id: "gtx7600gt",
        name: "NVIDIA GeForce 7600 GT",
        vram: "256 MB GDDR3",
        performanceScore: 2,
        price: 199,
        powerWatts: 67,
        recommendedPsu: 300,
        image: "img/NVIDIA (2005–2015)/7600gt.png"
    },
    {
        id: "gtx7300gt",
        name: "NVIDIA GeForce 7300 GT",
        vram: "128 MB DDR2",
        performanceScore: 1,
        price: 99,
        powerWatts: 25,
        recommendedPsu: 250,
        image: "img/NVIDIA (2005–2015)/7300gt.png"
    },
    { id: "geforce256", 
        name: "NVIDIA GeForce 256", 
        vram: "32 MB SDR / DDR", 
        performanceScore: 0.2, 
        price: 299, 
        powerWatts: 23, 
        recommendedPsu: 250, 
        image: "img/NVIDIA (2005–2015)/geforce256.png" },

    // ============================
    //   INTEL INTEGRATED GRAPHICS
    // ============================

    {
        id: "intel_uhd_770",
        name: "Intel UHD Graphics 770",
        vram: "Compartida",
        performanceScore: 20,
        price: 0,
        powerWatts: 15,
        recommendedPsu: 300,
        image: "img/INTEL INTEGRATED GRAPHICS/inteluhd770.png"
    },
    {
        id: "intel_uhd_750",
        name: "Intel UHD Graphics 750",
        vram: "Compartida",
        performanceScore: 14,
        price: 0,
        powerWatts: 15,
        recommendedPsu: 300,
        image: "img/INTEL INTEGRATED GRAPHICS/inteluhd750.png"
    },
    {
        id: "intel_uhd_730",
        name: "Intel UHD Graphics 730",
        vram: "Compartida",
        performanceScore: 12,
        price: 0,
        powerWatts: 15,
        recommendedPsu: 300,
        image: "img/INTEL INTEGRATED GRAPHICS/inteluhd730.png"
    },
    {
        id: "intel_uhd_710",
        name: "Intel UHD Graphics 710",
        vram: "Compartida",
        performanceScore: 8,
        price: 0,
        powerWatts: 15,
        recommendedPsu: 300,
        image: "img/INTEL INTEGRATED GRAPHICS/inteluhd710.png"
    },
    {
        id: "intel_uhd_630",
        name: "Intel UHD Graphics 630",
        vram: "Compartida",
        performanceScore: 10,
        price: 0,
        powerWatts: 15,
        recommendedPsu: 300,
        image: "img/INTEL INTEGRATED GRAPHICS/inteluhd630.png"
    },
    {
        id: "intel_uhd_620",
        name: "Intel UHD Graphics 620",
        vram: "Compartida",
        performanceScore: 9,
        price: 0,
        powerWatts: 15,
        recommendedPsu: 300,
        image: "img/INTEL INTEGRATED GRAPHICS/inteluhd620.png"
    },
    {
        id: "intel_uhd_605",
        name: "Intel UHD Graphics 605",
        vram: "Compartida",
        performanceScore: 6,
        price: 0,
        powerWatts: 15,
        recommendedPsu: 300,
        image: "img/INTEL INTEGRATED GRAPHICS/inteluhd605.png"
    },

];

// ============================
//   FUNCIÓN AUXILIAR
// ============================

function getGpuById(id) {
    return gpuData.find(gpu => gpu.id === id);
}