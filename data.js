const VOLUME_UNITS = {
  L: { label: "Litros", toLiters: 1 },
  m3: { label: "Metro cúbicos", toLiters: 1000 },
  bar: { label: "Barris", toLiters: 3.78541 }
};

const GROUP_COLORS = {
  "Ambiental": "ambiental",
  "Financeiro": "financeiro",
  "Sócio Político": "sociopolitico"
};

const WEB_CONFIG = {
  centerLabel: "Biocombust\u00edvel",
  centerRadius: 130,
  firstNodeRadius: 540,
  nodeStepRadius: 280,
  tracks: [

    {
      id: "environment-impact",
 //     title: "Ambiental",
      group: "Ambiental",
      points: [
        {
          id: "savedCo2",
          title: "CO2 economizado",
          outputUnit: "kg",
          factorPerLiter: 1.5, // vs. gasolina, ciclo de vida (UNICA / RenovaBio / Embrapa)
          sourceUrl: "https://unica.com.br/noticias/uso-do-etanol-evita-515-milhoes-de-toneladas-de-co2-na-atmosfera/"
        },
        {
          id: "treesEquivalent",
          title: "\u00c1rvores",
          outputUnit: "\u00e1rvores",
          factorPerLiter: 0.068, // 1,5 kg CO2 / 22 kg absorvidos por árvore nativa em 1 ano
          sourceUrl: "https://www.sosma.org.br/iniciativas/florestas-do-futuro/"
        }
      ]
    },
    {
      id: "energy-content",
      group: "Ambiental",
      points: [
        {
          id: "energyContentKwh",
          title: "Energia química",
          outputUnit: "kWh",
          factorPerLiter: 5.93, // PCI etanol hidratado: 0,510 tep/m³ × 11,63 MWh/tep = 5,93 kWh/L (BEN 2025)
          sourceUrl: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben"
        },
        {
          id: "energyContentMj",
          title: "Energia química",
          outputUnit: "MJ",
          factorPerLiter: 21.35, // PCI etanol hidratado: 0,510 tep/m³ × 41,868 GJ/tep = 21,35 MJ/L (BEN 2025)
          sourceUrl: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben"
        },
        {
          id: "tepEquivalent",
          title: "Tonelada equivalente de petróleo",
          outputUnit: "tep",
          factorPerLiter: 0.00051, // fator oficial BEN 2024 — etanol hidratado: 0,510 tep/m³
          sourceUrl: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben"
        }
      ]
    },
    {
      id: "bioelectricity-coprod",
      group: "Ambiental",
      points: [
        {
          id: "bioElectricitySin",
          title: "Bioeletricidade ao SIN",
          outputUnit: "kWh",
          factorPerLiter: 0.71, // bagaço da cana de origem exportado ao SIN: 21.125 GWh / 29,70 bi L etanol cana (EPE 2024, gráfico 33-34)
          sourceUrl: "https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-989/NT-EPE-DPG-SDB-2025-06_An%C3%A1lise%20de%20Conjuntura_Ano%20base%202024.pdf"
        },
        {
          id: "homesPowered",
          title: "Casas iluminadas (1 dia)",
          outputUnit: "casas",
          factorPerLiter: 0.118, // 0,71 kWh / consumo médio residencial 6,02 kWh/dia (ANEEL 2024 — 180,7 kWh/mês)
          sourceUrl: "https://portalrelatorios.aneel.gov.br/luznatarifa/consumomedio"
        }
      ]
    },
    {
      id: "fossil-substitution",
      group: "Ambiental",
      points: [
        {
          id: "gasolineReplaced",
          title: "Gasolina substituída",
          outputUnit: "L",
          factorPerLiter: 0.76, // uso veicular real: 16,50 bi L equiv. gasolina / 21,74 bi L etanol hidratado consumido em 2024 (EPE A-21 + ANP)
          sourceUrl: "https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-989/NT-EPE-DPG-SDB-2025-06_An%C3%A1lise%20de%20Conjuntura_Ano%20base%202024.pdf"
        },
        {
          id: "savedCo2Renovabio",
          title: "CO2 evitado (RenovaBio)",
          outputUnit: "kg",
          factorPerLiter: 1.264, // NEEA 59,2 gCO2eq/MJ × PCI 21,35 MJ/L (intensidade carbono ANP 2025 / EPE gráfico 51)
          sourceUrl: "https://www.gov.br/anp/pt-br/assuntos/renovabio"
        },
        {
          id: "savedCo2Biodiesel",
          title: "CO2 evitado — biodiesel",
          outputUnit: "kg",
          factorPerLiter: 2.188, // NEEA 65,98 gCO2eq/MJ × PCI 33,16 MJ/L (RenovaBio biodiesel)
          sourceUrl: "https://www.gov.br/anp/pt-br/assuntos/renovabio"
        }
      ]
    },
    {
      id: "physical-properties",
      group: "Ambiental",
      points: [
        {
          id: "massEtanol",
          title: "Massa (etanol hidratado)",
          outputUnit: "kg",
          factorPerLiter: 0.809, // densidade etanol hidratado (BEN Anexo VIII-9)
          sourceUrl: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben"
        },
        {
          id: "bagasseHeatEnergy",
          title: "Energia térmica do bagaço",
          outputUnit: "kWh",
          factorPerLiter: 8.67, // 3,5 kg bagaço/L × PCI 2.129,71 kcal/kg = 8,67 kWh térmicos coproduzidos (BEN VIII-9)
          sourceUrl: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben"
        }
      ]
    },
    {
      id: "fossil-equivalence-pci",
      group: "Ambiental",
      points: [
        {
          id: "gasolinePciEquivalent",
          title: "Gasolina (equivalência PCI)",
          outputUnit: "L",
          factorPerLiter: 0.661, // PCI puro: 21,35 MJ/L etanol ÷ 32,32 MJ/L gasolina (BEN VIII-9 — base teórica, sem ajuste de eficiência veicular)
          sourceUrl: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben"
        },
        {
          id: "dieselPciEquivalent",
          title: "Diesel equivalente (biodiesel)",
          outputUnit: "L",
          factorPerLiter: 0.933, // PCI puro: 33,16 MJ/L biodiesel ÷ 35,53 MJ/L diesel (BEN VIII-9)
          sourceUrl: "https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben"
        }
      ]
    },
    {
      id: "decarbonization-credits",
      group: "Ambiental",
      points: [
        {
          id: "cbioGenerated",
          title: "Créditos de descarbonização (CBio)",
          outputUnit: "CBio",
          factorPerLiter: 0.001264, // 1 CBio = 1 t CO2 evitada → 791 L etanol/CBio (derivado de 1,264 kg CO2/L NEEA EPE)
          sourceUrl: "https://www.gov.br/anp/pt-br/assuntos/renovabio"
        },
        {
          id: "flightKmCompensated",
          title: "Voo compensado",
          outputUnit: "km",
          factorPerLiter: 10.3, // 1.264 g CO2/L ÷ 123 g CO2/km/passageiro (IEA — média mundial aviação comercial)
          sourceUrl: "https://www.iea.org/data-and-statistics/charts/transport-co2-emissions-by-mode-2000-2030"
        }
      ]
    },
    {
      id: "everyday-equivalents",
      group: "Ambiental",
      points: [
        {
          id: "phoneCharges",
          title: "Cargas de celular",
          outputUnit: "cargas",
          factorPerLiter: 47, // bioeletricidade 0,71 kWh/L ÷ 0,015 kWh por carga (smartphone moderno — Canaltech 2026)
          sourceUrl: "https://canaltech.com.br/smartphone/quanto-custa-carregar-o-celular-por-ano-veja-o-impacto-real-na-conta-de-luz/"
        },
        {
          id: "ledLampHours",
          title: "Lâmpada LED 9W acesa",
          outputUnit: "horas",
          factorPerLiter: 79, // 0,71 kWh × 1000 / 9 W (bioeletricidade coproduto bagaço)
          sourceUrl: "https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-989/NT-EPE-DPG-SDB-2025-06_An%C3%A1lise%20de%20Conjuntura_Ano%20base%202024.pdf"
        }
      ]
    },
    {
      id: "industrial-use",
  //    title: "Uso industrial",
      group: "Financeiro",
      points: [
        {
          id: "Valor",
          title: "Valor",
          outputUnit: "R$",
          factorPerLiter: 4.44023, // preço médio nacional do etanol hidratado (ANP, semana 03-09/05/2026)
          sourceUrl: "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/serie-historica-de-precos-de-combustiveis"
        },
        {
          id: "Employees",
          title: "Empregos",
          outputUnit: "u",
          factorPerLiter: 0.0000203, // 730 mil empregos formais / 35,9 bilhões de litros (UNICA, safra 2023/24)
          sourceUrl: "https://unicadata.com.br/"
        }
      ]
    },
    {
      id: "agro-operations",
 //     title: "Opera\u00e7\u00e3o agr\u00edcola",
      group: "Financeiro",
      points: [
        {
          id: "Cana",
          title: "Canas de Açúcar",
          outputUnit: "kg",
          factorPerLiter: 12.5, // kg de cana necessários para produzir 1 L de etanol (~80 L/ton)
          sourceUrl: "https://www.embrapa.br/agroenergia/cana-de-acucar"
        },
        {
          id: "milhos",
          title: "Milhos",
          outputUnit: "kg",
          factorPerLiter: 2.46, // kg de milho necessários para produzir 1 L de etanol (~407 L/ton)
          sourceUrl: "https://cnabrasil.org.br/noticias/milho-invade-as-industrias-de-producao-de-etanol"
        }
      ]
    },
    {
      id: "mobility-light-heavy",
    //   title: "Frota rodada",
      group: "Sócio Político",
      points: [
        {
          id: "lightVehicleKm",
          title: "Ve\u00edculo leve",
          outputUnit: "km",
          factorPerLiter: 9, // carro flex moderno a etanol (INMETRO/Conpet PBE Veicular)
          sourceUrl: "https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica-veicular-pbe-veicular"
        },
        {
          id: "heavyVehicleKm",
          title: "Ve\u00edculo pesado",
          outputUnit: "km",
          factorPerLiter: 3, // caminhão/ônibus a biodiesel (B100 ou B14)
          sourceUrl: "https://www.gov.br/anp/pt-br/assuntos/producao-e-fornecimento-de-biocombustiveis/biodiesel"
        }
      ]
    },
    {
      id: "two-wheel-logistics",
  //    title: "Duas rodas",
      group: "Sócio Político",
      points: [
        {
          id: "motorcycleKm",
          title: "Moto",
          outputUnit: "km",
          factorPerLiter: 30, // moto flex 150cc a etanol — média de mercado
          sourceUrl: "https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica-veicular-pbe-veicular"
        },
        {
          id: "deliveryTrips",
          title: "Entregas urbanas",
          outputUnit: "trajetos",
          factorPerLiter: 6, // moto a 30 km/L com trajeto médio de 5 km por entrega
          sourceUrl: "https://www.gov.br/inmetro/pt-br/assuntos/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica-veicular-pbe-veicular"
        }
      ]
    },
    {
      id: "national-context",
      group: "Sócio Político",
      points: [
        {
          id: "shareOfNationalProduction",
          title: "% da produção nacional 2024",
          outputUnit: "%",
          factorPerLiter: 0.0000000027, // produção etanol Brasil 2024 = 36,96 bi L → 1 L = 2,7 × 10⁻⁹ % do total (ANP)
          sourceUrl: "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos"
        },
        {
          id: "shareOfNationalConsumption",
          title: "% do consumo nacional 2024",
          outputUnit: "%",
          factorPerLiter: 0.0000000046, // vendas hidratado Brasil 2024 = 21,74 bi L → 1 L = 4,6 × 10⁻⁹ % (ANP)
          sourceUrl: "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos"
        }
      ]
    },
    {
      id: "agro-coproducts",
      group: "Sócio Político",
      points: [
        {
          id: "bagasseProduced",
          title: "Bagaço da cana de origem",
          outputUnit: "kg",
          factorPerLiter: 3.5, // ~280 kg bagaço/t cana × 12,5 kg cana/L etanol (Embrapa / EPE)
          sourceUrl: "https://www.embrapa.br/agroenergia/cana-de-acucar"
        },
        {
          id: "atrEquivalent",
          title: "ATR (açúcares totais recuperáveis)",
          outputUnit: "kg",
          factorPerLiter: 1.75, // ATR médio 2024 = 95,95 Mt / 686,27 Mt cana × 12,5 kg cana/L = 1,75 kg ATR/L (EPE A-5)
          sourceUrl: "https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-989/NT-EPE-DPG-SDB-2025-06_An%C3%A1lise%20de%20Conjuntura_Ano%20base%202024.pdf"
        }
      ]
    },
    {
      id: "land-use",
      group: "Sócio Político",
      points: [
        {
          id: "caneFieldArea",
          title: "Área de cana plantada",
          outputUnit: "m²",
          factorPerLiter: 1.60, // 12,5 kg cana/L ÷ rendimento médio 77.901 kg/ha (IBGE PAM 2024)
          sourceUrl: "https://sidra.ibge.gov.br/tabela/1612"
        },
        {
          id: "cornFieldArea",
          title: "Área de milho plantada",
          outputUnit: "m²",
          factorPerLiter: 4.16, // 2,46 kg milho/L ÷ rendimento médio 5.913 kg/ha (IBGE PAM 2024)
          sourceUrl: "https://sidra.ibge.gov.br/tabela/1612"
        },
        {
          id: "soccerFieldsCane",
          title: "Campos de futebol (cana)",
          outputUnit: "campos",
          factorPerLiter: 0.000224, // 1,60 m² cana / 7.140 m² campo oficial FIFA (105×68 m)
          sourceUrl: "https://sidra.ibge.gov.br/tabela/1612"
        }
      ]
    },
    {
      id: "process-byproducts",
      group: "Sócio Político",
      points: [
        {
          id: "vinasseProduced",
          title: "Vinhaça (fertirrigação)",
          outputUnit: "L",
          factorPerLiter: 12, // média setorial — faixa 10-15 L vinhaça/L etanol cana (UNICA, USP, NovaCana)
          sourceUrl: "https://unica.com.br/noticias/vinhaca-biofertilizante-e-energia-sustentavel/"
        },
        {
          id: "industrialWaterUse",
          title: "Água consumida no processo",
          outputUnit: "L",
          factorPerLiter: 10.8, // 0,92 m³ água/t cana com 85 L etanol/t — destilaria anexa típica (NovaCana / CTC)
          sourceUrl: "https://www.novacana.com/cana/uso-agua-producao-cana-etanol"
        }
      ]
    }
  
  ]
};