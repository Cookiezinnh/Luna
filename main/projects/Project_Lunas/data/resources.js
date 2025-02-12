const resources = [
    // HasteBuff == Exclusivo dos Cabos, Aumenta a velocidade no qual o usuario pode usar o comando de minerar.
    // BlockBuff == Exclusivo das Peças de Fixação, Aumenta a quantidade de blocos no qual e minerado.
    // QuantityBuff == Exclusivo dos Minerios, Aumenta a quantidade de itens que cada bloco dropa.
    
    // Raridades baixas (comum a incomum)
    { id: 1, tier: 1, name: "Cabo Básico", rarity: "comum", price: 50, sellPrice: 37.5, hastebuff: 1, blockbuff: 0 },
    { id: 2, tier: 1, name: "Peça de Ferro", rarity: "comum", price: 100, sellPrice: 75, hastebuff: 0, blockbuff: 1 },
    { id: 3, tier: 1, name: "Corda Simples", rarity: "comum", price: 75, sellPrice: 56.25, hastebuff: 0, blockbuff: 0 },
  
    // Raridades médias (raro a muito raro)
    { id: 4, tier: 5, name: "Cabo Raro", rarity: "raro", price: 200, sellPrice: 150, hastebuff: 1.5, blockbuff: 0 },
    { id: 5, tier: 5, name: "Peça de Prata", rarity: "raro", price: 400, sellPrice: 300, hastebuff: 0, blockbuff: 2 },
    { id: 6, tier: 5, name: "Corda Reforçada", rarity: "raro", price: 300, sellPrice: 225, hastebuff: 0, blockbuff: 0 },
  
    // Raridades altas (épico)
    { id: 7, tier: 9, name: "Cabo Refinado", rarity: "épico", price: 800, sellPrice: 600, hastebuff: 2, blockbuff: 0 },
    { id: 8, tier: 9, name: "Peça de Platina", rarity: "épico", price: 1600, sellPrice: 1200, hastebuff: 0, blockbuff: 3 },
    { id: 9, tier: 9, name: "Corda Durável", rarity: "épico", price: 1200, sellPrice: 900, hastebuff: 0, blockbuff: 0 },
  
    // Raridades lendárias (lendário)
    { id: 10, tier: 13, name: "Cabo Lendário", rarity: "lendário", price: 3200, sellPrice: 2400, hastebuff: 2.5, blockbuff: 0 },
    { id: 11, tier: 13, name: "Peça de Oricalco", rarity: "lendário", price: 6400, sellPrice: 4800, hastebuff: 0, blockbuff: 4 },
    { id: 12, tier: 13, name: "Corda Indestrutível", rarity: "lendário", price: 4800, sellPrice: 3600, hastebuff: 0, blockbuff: 0 }
  ];
  
  module.exports = { resources };
  