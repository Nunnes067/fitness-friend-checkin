export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: string;
  equipment: string;
}

export const exerciseDatabase: Exercise[] = [
  // Pernas/Glúteos - Musculação
  { id: "agachamento-livre", name: "Agachamento livre", muscleGroup: "Pernas/Glúteos", type: "Musculação", equipment: "Barra" },
  { id: "agachamento-smith", name: "Agachamento no smith", muscleGroup: "Pernas/Glúteos", type: "Musculação", equipment: "Smith" },
  { id: "agachamento-halteres", name: "Agachamento com halteres", muscleGroup: "Pernas/Glúteos", type: "Musculação", equipment: "Halteres" },
  { id: "leg-press-45", name: "Leg press 45°", muscleGroup: "Pernas", type: "Máquina", equipment: "Leg press" },
  { id: "cadeira-extensora", name: "Cadeira extensora", muscleGroup: "Quadríceps", type: "Máquina", equipment: "Extensora" },
  { id: "mesa-flexora", name: "Mesa flexora", muscleGroup: "Posterior", type: "Máquina", equipment: "Flexora" },
  { id: "stiff-barra", name: "Stiff com barra", muscleGroup: "Posterior/Glúteos", type: "Musculação", equipment: "Barra" },
  { id: "levantamento-terra", name: "Levantamento terra", muscleGroup: "Pernas/Costas", type: "Musculação", equipment: "Barra" },
  { id: "afundo", name: "Afundo", muscleGroup: "Pernas/Glúteos", type: "Funcional", equipment: "Peso corporal" },
  { id: "passada-caminhando", name: "Passada caminhando", muscleGroup: "Pernas/Glúteos", type: "Funcional", equipment: "Peso corporal" },
  { id: "agachamento-bulgaro", name: "Agachamento búlgaro", muscleGroup: "Glúteos", type: "Funcional", equipment: "Banco" },
  { id: "elevacao-pelvica", name: "Elevação pélvica", muscleGroup: "Glúteos", type: "Musculação", equipment: "Barra" },
  { id: "glute-bridge", name: "Glute bridge", muscleGroup: "Glúteos", type: "Funcional", equipment: "Peso corporal" },
  { id: "sumo-deadlift", name: "Sumo deadlift", muscleGroup: "Glúteos/Posterior", type: "Musculação", equipment: "Barra" },
  { id: "panturrilha-em-pe", name: "Panturrilha em pé", muscleGroup: "Panturrilhas", type: "Máquina", equipment: "Panturrilha" },
  { id: "panturrilha-sentado", name: "Panturrilha sentado", muscleGroup: "Panturrilhas", type: "Máquina", equipment: "Panturrilha" },
  { id: "subida-banco", name: "Subida no banco", muscleGroup: "Pernas", type: "Funcional", equipment: "Banco" },

  // Cardio
  { id: "corrida-esteira", name: "Corrida na esteira", muscleGroup: "Cardio", type: "Cardio", equipment: "Esteira" },
  { id: "corrida-ar-livre", name: "Corrida ao ar livre", muscleGroup: "Cardio", type: "Cardio", equipment: "Ar livre" },
  { id: "caminhada-inclinada", name: "Caminhada inclinada", muscleGroup: "Cardio", type: "Cardio", equipment: "Esteira" },
  { id: "bicicleta-ergometrica", name: "Bicicleta ergométrica", muscleGroup: "Cardio", type: "Cardio", equipment: "Bike" },
  { id: "spinning", name: "Spinning", muscleGroup: "Cardio", type: "Cardio", equipment: "Bike indoor" },
  { id: "escada-ergometrica", name: "Escada ergométrica", muscleGroup: "Cardio", type: "Cardio", equipment: "Stairs" },
  { id: "remo-indoor", name: "Remo indoor", muscleGroup: "Cardio", type: "Cardio", equipment: "Remo" },
  { id: "pular-corda", name: "Pular corda", muscleGroup: "Cardio", type: "Cardio", equipment: "Corda" },
  { id: "burpee", name: "Burpee", muscleGroup: "Corpo inteiro", type: "Calistenia", equipment: "Peso corporal" },
  { id: "polichinelo", name: "Polichinelo", muscleGroup: "Cardio", type: "Calistenia", equipment: "Peso corporal" },

  // Abdômen/Core
  { id: "prancha", name: "Prancha", muscleGroup: "Abdômen/Core", type: "Funcional", equipment: "Peso corporal" },
  { id: "prancha-lateral", name: "Prancha lateral", muscleGroup: "Abdômen/Core", type: "Funcional", equipment: "Peso corporal" },
  { id: "abdominal-supra", name: "Abdominal supra", muscleGroup: "Abdômen", type: "Calistenia", equipment: "Peso corporal" },
  { id: "abdominal-infra", name: "Abdominal infra", muscleGroup: "Abdômen", type: "Calistenia", equipment: "Peso corporal" },
  { id: "abdominal-bicicleta", name: "Abdominal bicicleta", muscleGroup: "Abdômen", type: "Calistenia", equipment: "Peso corporal" },
  { id: "abdominal-remador", name: "Abdominal remador", muscleGroup: "Abdômen", type: "Funcional", equipment: "Peso corporal" },
  { id: "abdominal-prancha-alternada", name: "Abdominal prancha alternada", muscleGroup: "Abdômen", type: "Funcional", equipment: "Peso corporal" },
  { id: "hipopressivo", name: "Hipopressivo", muscleGroup: "Abdômen", type: "Funcional", equipment: "Peso corporal" },

  // Peito
  { id: "flexao-tradicional", name: "Flexão de braço tradicional", muscleGroup: "Peito/Tríceps", type: "Calistenia", equipment: "Peso corporal" },
  { id: "flexao-inclinada", name: "Flexão inclinada", muscleGroup: "Peito", type: "Calistenia", equipment: "Banco" },
  { id: "flexao-declinada", name: "Flexão declinada", muscleGroup: "Peito", type: "Calistenia", equipment: "Banco" },
  { id: "supino-reto-barra", name: "Supino reto barra", muscleGroup: "Peito", type: "Musculação", equipment: "Barra" },
  { id: "supino-inclinado", name: "Supino inclinado", muscleGroup: "Peito", type: "Musculação", equipment: "Barra" },
  { id: "supino-reto-halteres", name: "Supino reto halteres", muscleGroup: "Peito", type: "Musculação", equipment: "Halteres" },
  { id: "supino-inclinado-halteres", name: "Supino inclinado halteres", muscleGroup: "Peito", type: "Musculação", equipment: "Halteres" },
  { id: "crucifixo-reto", name: "Crucifixo reto", muscleGroup: "Peito", type: "Musculação", equipment: "Halteres" },
  { id: "crucifixo-inclinado", name: "Crucifixo inclinado", muscleGroup: "Peito", type: "Musculação", equipment: "Halteres" },
  { id: "peck-deck", name: "Peck deck", muscleGroup: "Peito", type: "Máquina", equipment: "Peck deck" },
  { id: "cross-over", name: "Cross over", muscleGroup: "Peito", type: "Crossover", equipment: "Cabos" },
  { id: "pullover", name: "Pullover", muscleGroup: "Peito/Costas", type: "Musculação", equipment: "Halteres" },

  // Costas
  { id: "barra-fixa", name: "Barra fixa", muscleGroup: "Costas", type: "Calistenia", equipment: "Barra" },
  { id: "pulldown", name: "Pulldown", muscleGroup: "Costas", type: "Máquina", equipment: "Polia" },
  { id: "remada-baixa", name: "Remada baixa", muscleGroup: "Costas", type: "Máquina", equipment: "Cabo" },
  { id: "remada-curvada", name: "Remada curvada", muscleGroup: "Costas", type: "Musculação", equipment: "Barra" },
  { id: "remada-unilateral", name: "Remada unilateral", muscleGroup: "Costas", type: "Musculação", equipment: "Halteres" },
  { id: "remada-cavalinho", name: "Remada cavalinho", muscleGroup: "Costas", type: "Musculação", equipment: "Máquina" },
  { id: "levantamento-terra-classico", name: "Levantamento terra clássico", muscleGroup: "Costas/Pernas", type: "Musculação", equipment: "Barra" },

  // Ombros
  { id: "encolhimento-ombros", name: "Encolhimento de ombros", muscleGroup: "Trapézio", type: "Musculação", equipment: "Halteres" },
  { id: "desenvolvimento-militar", name: "Desenvolvimento militar", muscleGroup: "Ombros", type: "Musculação", equipment: "Barra" },
  { id: "desenvolvimento-halteres", name: "Desenvolvimento com halteres", muscleGroup: "Ombros", type: "Musculação", equipment: "Halteres" },
  { id: "elevacao-lateral", name: "Elevação lateral", muscleGroup: "Ombros", type: "Musculação", equipment: "Halteres" },
  { id: "elevacao-frontal", name: "Elevação frontal", muscleGroup: "Ombros", type: "Musculação", equipment: "Halteres" },
  { id: "crucifixo-inverso", name: "Crucifixo inverso", muscleGroup: "Ombros", type: "Máquina", equipment: "Máquina" },

  // Bíceps
  { id: "rosca-direta", name: "Rosca direta", muscleGroup: "Bíceps", type: "Musculação", equipment: "Barra" },
  { id: "rosca-alternada", name: "Rosca alternada", muscleGroup: "Bíceps", type: "Musculação", equipment: "Halteres" },
  { id: "rosca-martelo", name: "Rosca martelo", muscleGroup: "Bíceps", type: "Musculação", equipment: "Halteres" },
  { id: "rosca-concentrada", name: "Rosca concentrada", muscleGroup: "Bíceps", type: "Musculação", equipment: "Halteres" },
  { id: "rosca-scott", name: "Rosca scott", muscleGroup: "Bíceps", type: "Máquina", equipment: "Máquina" },

  // Tríceps
  { id: "triceps-pulley", name: "Tríceps pulley", muscleGroup: "Tríceps", type: "Musculação", equipment: "Cabo" },
  { id: "triceps-testa", name: "Tríceps testa", muscleGroup: "Tríceps", type: "Musculação", equipment: "Barra" },
  { id: "triceps-frances", name: "Tríceps francês", muscleGroup: "Tríceps", type: "Musculação", equipment: "Halteres" },
  { id: "mergulho-banco", name: "Mergulho em banco", muscleGroup: "Tríceps", type: "Calistenia", equipment: "Peso corporal" },
  { id: "triceps-corda", name: "Tríceps corda", muscleGroup: "Tríceps", type: "Crossover", equipment: "Crossover" },

  // Funcional com Kettlebell
  { id: "kettlebell-swing", name: "Kettlebell swing", muscleGroup: "Corpo inteiro", type: "Funcional", equipment: "Kettlebell" },
  { id: "kettlebell-sumo-high-pull", name: "Kettlebell sumo high pull", muscleGroup: "Corpo inteiro", type: "Funcional", equipment: "Kettlebell" },
  { id: "kettlebell-clean", name: "Kettlebell clean", muscleGroup: "Corpo inteiro", type: "Funcional", equipment: "Kettlebell" },
  { id: "kettlebell-snatch", name: "Kettlebell snatch", muscleGroup: "Corpo inteiro", type: "Funcional", equipment: "Kettlebell" },

  // Funcional com Medicine Ball
  { id: "wall-ball", name: "Wall ball", muscleGroup: "Corpo inteiro", type: "Funcional", equipment: "Medicine ball" },
  { id: "lancamento-medicine-ball", name: "Lançamento de medicine ball", muscleGroup: "Peito", type: "Funcional", equipment: "Medicine ball" },
  { id: "agachamento-medicine-ball", name: "Agachamento com medicine ball", muscleGroup: "Pernas", type: "Funcional", equipment: "Medicine ball" },

  // Cardio Funcional
  { id: "corrida-lateral", name: "Corrida lateral", muscleGroup: "Cardio", type: "Funcional", equipment: "Peso corporal" },
  { id: "saltos-pliometricos", name: "Saltos pliométricos", muscleGroup: "Pernas", type: "Calistenia", equipment: "Peso corporal" },
  { id: "agachamento-salto", name: "Agachamento com salto", muscleGroup: "Pernas", type: "Calistenia", equipment: "Peso corporal" },
  { id: "passada-salto", name: "Passada com salto", muscleGroup: "Pernas", type: "Calistenia", equipment: "Peso corporal" },
  { id: "mountain-climber", name: "Escalador (mountain climber)", muscleGroup: "Abdômen/Cardio", type: "Funcional", equipment: "Peso corporal" },
  { id: "bear-crawl", name: "Bear crawl", muscleGroup: "Corpo inteiro", type: "Funcional", equipment: "Peso corporal" },
  { id: "polichinelo-cruzado", name: "Polichinelo cruzado", muscleGroup: "Cardio", type: "Calistenia", equipment: "Peso corporal" },
  { id: "sprint-curto", name: "Sprint curto", muscleGroup: "Cardio", type: "Cardio", equipment: "Ar livre" },
  { id: "trote-leve", name: "Trote leve", muscleGroup: "Cardio", type: "Cardio", equipment: "Ar livre" },
  { id: "corrida-intervalada", name: "Corrida intervalada", muscleGroup: "Cardio", type: "Funcional", equipment: "Peso corporal" },
  { id: "hiit-20-10", name: "HIIT 20/10", muscleGroup: "Cardio", type: "Funcional", equipment: "Peso corporal" },

  // Luta/Artes Marciais
  { id: "shadow-boxing", name: "Shadow boxing", muscleGroup: "Cardio", type: "Funcional", equipment: "Peso corporal" },
  { id: "boxe-saco", name: "Boxe no saco", muscleGroup: "Cardio/Braços", type: "Luta", equipment: "Saco de pancada" },
  { id: "muay-thai-chute-frontal", name: "Muay thai chute frontal", muscleGroup: "Pernas", type: "Luta", equipment: "Peso corporal" },
  { id: "muay-thai-joelhada", name: "Muay thai joelhada", muscleGroup: "Pernas/Core", type: "Luta", equipment: "Peso corporal" },
  { id: "capoeira-ginga", name: "Golpe de capoeira ginga", muscleGroup: "Corpo inteiro", type: "Capoeira", equipment: "Peso corporal" },
  { id: "meia-lua-capoeira", name: "Meia-lua de capoeira", muscleGroup: "Corpo inteiro", type: "Capoeira", equipment: "Peso corporal" },
  { id: "pendulo-capoeira", name: "Pêndulo de capoeira", muscleGroup: "Pernas", type: "Capoeira", equipment: "Peso corporal" },

  // Abdômen avançado
  { id: "prancha-ombro-alternado", name: "Prancha com ombro alternado", muscleGroup: "Core", type: "Funcional", equipment: "Peso corporal" },
  { id: "prancha-elevacao-perna", name: "Prancha com elevação de perna", muscleGroup: "Core", type: "Funcional", equipment: "Peso corporal" },
  { id: "abdominal-canivete", name: "Abdominal canivete", muscleGroup: "Abdômen", type: "Calistenia", equipment: "Peso corporal" },
  { id: "elevacao-pernas-barra", name: "Elevação de pernas na barra", muscleGroup: "Abdômen", type: "Calistenia", equipment: "Barra" },
  { id: "abdominal-polia", name: "Abdominal na polia", muscleGroup: "Abdômen", type: "Musculação", equipment: "Polia" },
];

export const muscleGroups = [
  "Todos",
  "Pernas",
  "Pernas/Glúteos",
  "Glúteos",
  "Quadríceps",
  "Posterior",
  "Posterior/Glúteos",
  "Glúteos/Posterior",
  "Panturrilhas",
  "Pernas/Costas",
  "Costas/Pernas",
  "Cardio",
  "Abdômen",
  "Abdômen/Core",
  "Core",
  "Abdômen/Cardio",
  "Cardio/Braços",
  "Peito",
  "Peito/Tríceps",
  "Peito/Costas",
  "Costas",
  "Ombros",
  "Trapézio",
  "Bíceps",
  "Tríceps",
  "Corpo inteiro",
  "Pernas/Core",
];

export const exerciseTypes = [
  "Todos",
  "Musculação",
  "Máquina",
  "Funcional",
  "Calistenia",
  "Cardio",
  "Crossover",
  "Luta",
  "Capoeira",
];

export const equipmentTypes = [
  "Todos",
  "Barra",
  "Halteres",
  "Peso corporal",
  "Máquina",
  "Cabo",
  "Polia",
  "Smith",
  "Leg press",
  "Extensora",
  "Flexora",
  "Panturrilha",
  "Banco",
  "Peck deck",
  "Cabos",
  "Esteira",
  "Bike",
  "Bike indoor",
  "Stairs",
  "Remo",
  "Corda",
  "Kettlebell",
  "Medicine ball",
  "Crossover",
  "Ar livre",
  "Saco de pancada",
];
