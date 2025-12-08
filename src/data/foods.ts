export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const foodDatabase: FoodItem[] = [
  // Cereais
  { id: "arroz-branco", name: "Arroz branco", category: "Cereais", calories: 128, protein: 2.5, carbs: 28, fat: 0.3 },
  { id: "tapioca", name: "Tapioca", category: "Cereais", calories: 168, protein: 0, carbs: 41, fat: 0 },
  { id: "cuscuz-nordestino", name: "Cuscuz nordestino", category: "Cereais", calories: 112, protein: 2.4, carbs: 25, fat: 0.2 },
  { id: "arroz-integral", name: "Arroz integral", category: "Cereais", calories: 124, protein: 2.6, carbs: 26, fat: 1 },
  { id: "granola", name: "Granola", category: "Cereais", calories: 471, protein: 10, carbs: 64, fat: 20 },
  { id: "aveia", name: "Aveia", category: "Cereais", calories: 389, protein: 17, carbs: 66, fat: 7 },

  // Leguminosas
  { id: "feijao-carioca", name: "Feijão carioca", category: "Leguminosas", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
  { id: "feijao-preto", name: "Feijão preto", category: "Leguminosas", calories: 77, protein: 4.5, carbs: 14, fat: 0.3 },
  { id: "feijao-verde", name: "Feijão verde", category: "Leguminosas", calories: 70, protein: 6, carbs: 12, fat: 0.5 },
  { id: "lentilha-cozida", name: "Lentilha cozida", category: "Leguminosas", calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: "grao-de-bico", name: "Grão-de-bico", category: "Leguminosas", calories: 164, protein: 9, carbs: 27, fat: 2 },

  // Tubérculos
  { id: "mandioca-cozida", name: "Mandioca cozida", category: "Tubérculos", calories: 125, protein: 1, carbs: 30, fat: 0.3 },
  { id: "batata-doce", name: "Batata doce", category: "Tubérculos", calories: 86, protein: 1.2, carbs: 20, fat: 0.1 },
  { id: "inhame", name: "Inhame", category: "Tubérculos", calories: 94, protein: 2, carbs: 22, fat: 0.2 },
  { id: "batata-inglesa", name: "Batata inglesa", category: "Tubérculos", calories: 70, protein: 1.9, carbs: 16, fat: 0.1 },

  // Carnes
  { id: "frango-grelhado", name: "Frango grelhado", category: "Carnes", calories: 165, protein: 31, carbs: 0, fat: 4 },
  { id: "bife-acebolado", name: "Bife acebolado", category: "Carnes", calories: 250, protein: 27, carbs: 3, fat: 12 },
  { id: "carne-moida", name: "Carne moída", category: "Carnes", calories: 250, protein: 26, carbs: 0, fat: 15 },

  // Embutidos
  { id: "linguica-toscana", name: "Linguiça toscana", category: "Embutidos", calories: 320, protein: 14, carbs: 2, fat: 28 },
  { id: "salsicha", name: "Salsicha", category: "Embutidos", calories: 290, protein: 12, carbs: 3, fat: 25 },

  // Ovos
  { id: "ovo-cozido", name: "Ovo cozido", category: "Ovos", calories: 155, protein: 13, carbs: 1, fat: 10 },
  { id: "ovo-frito", name: "Ovo frito", category: "Ovos", calories: 200, protein: 12, carbs: 2, fat: 15 },

  // Laticínios
  { id: "queijo-minas", name: "Queijo minas", category: "Laticínios", calories: 264, protein: 17, carbs: 3, fat: 20 },
  { id: "queijo-prato", name: "Queijo prato", category: "Laticínios", calories: 340, protein: 22, carbs: 3, fat: 26 },
  { id: "requeijao", name: "Requeijão", category: "Laticínios", calories: 250, protein: 6, carbs: 2, fat: 22 },
  { id: "leite-integral", name: "Leite integral", category: "Laticínios", calories: 62, protein: 3, carbs: 5, fat: 3 },
  { id: "iogurte-natural", name: "Iogurte natural", category: "Laticínios", calories: 60, protein: 3, carbs: 4, fat: 3 },

  // Frutas
  { id: "acai-puro", name: "Açaí puro", category: "Frutas", calories: 247, protein: 2, carbs: 12, fat: 15 },
  { id: "banana-prata", name: "Banana prata", category: "Frutas", calories: 89, protein: 1, carbs: 22, fat: 0.3 },
  { id: "banana-nanica", name: "Banana nanica", category: "Frutas", calories: 98, protein: 1.2, carbs: 25, fat: 0.3 },
  { id: "maca", name: "Maçã", category: "Frutas", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: "manga", name: "Manga", category: "Frutas", calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  { id: "mamao-papaia", name: "Mamão papaia", category: "Frutas", calories: 43, protein: 0.5, carbs: 11, fat: 0.1 },
  { id: "goiaba", name: "Goiaba", category: "Frutas", calories: 68, protein: 2.6, carbs: 14, fat: 1 },
  { id: "abacaxi", name: "Abacaxi", category: "Frutas", calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { id: "abacate", name: "Abacate", category: "Frutas", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { id: "melao", name: "Melão", category: "Frutas", calories: 34, protein: 0.8, carbs: 8, fat: 0.2 },
  { id: "melancia", name: "Melancia", category: "Frutas", calories: 30, protein: 0.6, carbs: 8, fat: 0.1 },
  { id: "uva", name: "Uva", category: "Frutas", calories: 69, protein: 0.8, carbs: 18, fat: 0.2 },
  { id: "caqui", name: "Caqui", category: "Frutas", calories: 70, protein: 0.6, carbs: 19, fat: 0.2 },
  { id: "limao", name: "Limão", category: "Frutas", calories: 22, protein: 0.4, carbs: 7, fat: 0.1 },
  { id: "laranja", name: "Laranja", category: "Frutas", calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { id: "tangerina", name: "Tangerina", category: "Frutas", calories: 53, protein: 0.8, carbs: 13, fat: 0.3 },
  { id: "kiwi", name: "Kiwi", category: "Frutas", calories: 61, protein: 1, carbs: 15, fat: 0.5 },
  { id: "maracuja", name: "Maracujá", category: "Frutas", calories: 70, protein: 2, carbs: 14, fat: 0.4 },
  { id: "acerola", name: "Acerola", category: "Frutas", calories: 32, protein: 0.9, carbs: 8, fat: 0.2 },
  { id: "caju", name: "Caju", category: "Frutas", calories: 43, protein: 0.9, carbs: 10, fat: 0.1 },
  { id: "jabuticaba", name: "Jabuticaba", category: "Frutas", calories: 58, protein: 0.6, carbs: 15, fat: 0.2 },

  // Vegetais
  { id: "milho-cozido", name: "Milho cozido", category: "Vegetais", calories: 105, protein: 3, carbs: 25, fat: 1 },
  { id: "beterraba-cozida", name: "Beterraba cozida", category: "Vegetais", calories: 48, protein: 1.7, carbs: 10, fat: 0.1 },
  { id: "cenoura-cozida", name: "Cenoura cozida", category: "Vegetais", calories: 35, protein: 0.8, carbs: 8, fat: 0.2 },
  { id: "tomate", name: "Tomate", category: "Vegetais", calories: 18, protein: 0.9, carbs: 4, fat: 0.2 },
  { id: "alface", name: "Alface", category: "Vegetais", calories: 14, protein: 1.4, carbs: 2, fat: 0.2 },
  { id: "couve-refogada", name: "Couve refogada", category: "Vegetais", calories: 90, protein: 3, carbs: 10, fat: 5 },
  { id: "espinafre", name: "Espinafre", category: "Vegetais", calories: 23, protein: 2.2, carbs: 3, fat: 0.3 },
  { id: "chuchu-cozido", name: "Chuchu cozido", category: "Vegetais", calories: 19, protein: 0.5, carbs: 4, fat: 0 },
  { id: "abobrinha", name: "Abobrinha", category: "Vegetais", calories: 17, protein: 1.2, carbs: 3, fat: 0.3 },
  { id: "berinjela", name: "Berinjela", category: "Vegetais", calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  { id: "brocolis-cozido", name: "Brócolis cozido", category: "Vegetais", calories: 35, protein: 2.4, carbs: 7, fat: 0.4 },
  { id: "couve-flor", name: "Couve-flor", category: "Vegetais", calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  { id: "pepino", name: "Pepino", category: "Vegetais", calories: 15, protein: 0.6, carbs: 3, fat: 0.1 },
  { id: "repolho", name: "Repolho", category: "Vegetais", calories: 25, protein: 1.3, carbs: 6, fat: 0.1 },
  { id: "maxixe", name: "Maxixe", category: "Vegetais", calories: 18, protein: 1, carbs: 4, fat: 0.1 },
  { id: "quiabo", name: "Quiabo", category: "Vegetais", calories: 31, protein: 1.9, carbs: 7, fat: 0.1 },
  { id: "jilo", name: "Jiló", category: "Vegetais", calories: 27, protein: 1.4, carbs: 5, fat: 0.2 },
  { id: "vagem", name: "Vagem", category: "Vegetais", calories: 28, protein: 2, carbs: 5, fat: 0.1 },
  { id: "couve-manteiga", name: "Couve manteiga", category: "Vegetais", calories: 34, protein: 2.5, carbs: 5, fat: 0.2 },
  { id: "pimentao", name: "Pimentão", category: "Vegetais", calories: 31, protein: 0.8, carbs: 6, fat: 0.3 },

  // Panificados
  { id: "pao-frances", name: "Pão francês", category: "Panificados", calories: 290, protein: 8, carbs: 55, fat: 3 },
  { id: "pao-de-queijo", name: "Pão de queijo", category: "Panificados", calories: 363, protein: 5, carbs: 35, fat: 22 },

  // Salgados
  { id: "coxinha", name: "Coxinha", category: "Salgados", calories: 320, protein: 10, carbs: 30, fat: 18 },
  { id: "pastel-de-carne", name: "Pastel de carne", category: "Salgados", calories: 300, protein: 9, carbs: 26, fat: 18 },

  // Preparados
  { id: "farofa-pronta", name: "Farofa pronta", category: "Preparados", calories: 410, protein: 2, carbs: 70, fat: 12 },
  { id: "pamonha-doce", name: "Pamonha doce", category: "Preparados", calories: 250, protein: 4, carbs: 45, fat: 3 },
  { id: "curau-de-milho", name: "Curau de milho", category: "Preparados", calories: 120, protein: 2, carbs: 20, fat: 3 },
  { id: "batata-frita", name: "Batata frita", category: "Preparados", calories: 312, protein: 3, carbs: 41, fat: 15 },
  { id: "torta-salgada", name: "Torta salgada", category: "Preparados", calories: 280, protein: 8, carbs: 24, fat: 16 },
  { id: "lasanha", name: "Lasanha", category: "Preparados", calories: 135, protein: 7, carbs: 15, fat: 6 },

  // Oleaginosas
  { id: "amendoim", name: "Amendoim", category: "Oleaginosas", calories: 567, protein: 25, carbs: 16, fat: 49 },
  { id: "castanha-de-caju", name: "Castanha de caju", category: "Oleaginosas", calories: 553, protein: 18, carbs: 30, fat: 44 },
  { id: "castanha-do-para", name: "Castanha-do-pará", category: "Oleaginosas", calories: 656, protein: 14, carbs: 12, fat: 66 },
  { id: "nozes", name: "Nozes", category: "Oleaginosas", calories: 654, protein: 15, carbs: 14, fat: 65 },

  // Bebidas
  { id: "cha-mate", name: "Chá mate", category: "Bebidas", calories: 5, protein: 0, carbs: 1, fat: 0 },
  { id: "cafe-sem-acucar", name: "Café sem açúcar", category: "Bebidas", calories: 2, protein: 0, carbs: 0, fat: 0 },
  { id: "suco-de-laranja", name: "Suco de laranja", category: "Bebidas", calories: 45, protein: 0.7, carbs: 10, fat: 0.2 },
  { id: "refrigerante", name: "Refrigerante", category: "Bebidas", calories: 41, protein: 0, carbs: 11, fat: 0 },
  { id: "agua-de-coco", name: "Água de coco", category: "Bebidas", calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2 },
  { id: "vitamina-de-banana", name: "Vitamina de banana", category: "Bebidas", calories: 95, protein: 3, carbs: 20, fat: 1 },
  { id: "achocolatado", name: "Achocolatado", category: "Bebidas", calories: 90, protein: 3, carbs: 15, fat: 1.5 },

  // Sobremesas
  { id: "sorvete-de-creme", name: "Sorvete de creme", category: "Sobremesas", calories: 207, protein: 3.5, carbs: 24, fat: 11 },
  { id: "pudim", name: "Pudim", category: "Sobremesas", calories: 145, protein: 4, carbs: 25, fat: 3 },
  { id: "brigadeiro", name: "Brigadeiro", category: "Sobremesas", calories: 350, protein: 4, carbs: 50, fat: 15 },

  // Doces
  { id: "pacoca", name: "Paçoca", category: "Doces", calories: 480, protein: 13, carbs: 50, fat: 25 },
  { id: "doce-de-leite", name: "Doce de leite", category: "Doces", calories: 315, protein: 6, carbs: 55, fat: 8 },
  { id: "goiabada", name: "Goiabada", category: "Doces", calories: 280, protein: 0, carbs: 74, fat: 0 },
  { id: "gelatina", name: "Gelatina", category: "Doces", calories: 60, protein: 1, carbs: 14, fat: 0 },
  { id: "bolo-simples", name: "Bolo simples", category: "Doces", calories: 260, protein: 4, carbs: 38, fat: 9 },
  { id: "arroz-doce", name: "Arroz doce", category: "Doces", calories: 110, protein: 2, carbs: 22, fat: 1 },
  { id: "canjica", name: "Canjica", category: "Doces", calories: 228, protein: 6, carbs: 38, fat: 4 },
  { id: "mousse-de-maracuja", name: "Mousse de maracujá", category: "Doces", calories: 215, protein: 3, carbs: 30, fat: 9 },
];

export const foodCategories = [
  "Todos",
  "Cereais",
  "Leguminosas",
  "Tubérculos",
  "Carnes",
  "Embutidos",
  "Ovos",
  "Laticínios",
  "Frutas",
  "Vegetais",
  "Panificados",
  "Salgados",
  "Preparados",
  "Oleaginosas",
  "Bebidas",
  "Sobremesas",
  "Doces",
];
