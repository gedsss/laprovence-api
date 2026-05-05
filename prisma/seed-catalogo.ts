import 'dotenv/config'
import { prisma } from './prismaClient.js'

type Setor = 'Mesa_posta' | 'Prataria' | 'Adornos' | 'Aromas' | 'Mobiliario' | 'Vasos' | 'Complementos'

interface Item {
  nome: string
  marca?: string
  tamanho?: string
  preco: string
  setor: Setor
}

// 75 itens (todos do CSV, incluindo os já cadastrados)
const items: Item[] = [
  { nome: 'Conj. 6 Taças Crystal Glass', marca: 'Bohemia', tamanho: '300ml', preco: '1303.50', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Copos Azul Lapidado em Vidro', marca: 'La Provence Decor', tamanho: '400ml', preco: '585.00', setor: 'Mesa_posta' },
  { nome: 'Jarra em Vidro Pétalas La Provence Decor', marca: 'Fracalanza', tamanho: '1,8L', preco: '359.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 4 Copos em Vidro Pétalas La Provence Decor', marca: 'Fracalanza', tamanho: '480ml', preco: '489.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Copos Verde Lapidado em Vidro', marca: 'La Provence Decor', tamanho: '400ml', preco: '585.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Taças em Cristal para Água Verde Lapidada', marca: 'Bohemia', tamanho: '300ml', preco: '610.00', setor: 'Mesa_posta' },
  { nome: 'Jarra em Vidro Borosil', marca: 'Fracalanza', tamanho: '1,2L', preco: '175.00', setor: 'Mesa_posta' },
  { nome: 'Jarra em Vidro Pétalas Verde', marca: 'Fracalanza', tamanho: '1,8L', preco: '359.00', setor: 'Mesa_posta' },
  { nome: 'Jogo 2 Taças para Vinho em Vidro Pétalas Verde', marca: 'Fracalanza', tamanho: '500ml', preco: '300.00', setor: 'Mesa_posta' },
  { nome: 'Centro de Mesa em Cristal', marca: 'Bohemia', preco: '990.00', setor: 'Adornos' },
  { nome: 'Decanter em Vidro', marca: 'Wolff', tamanho: '1,5L', preco: '125.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 1 Saleiro 1 Pimenteira em Cristal Chumbo', marca: 'Bohemia', preco: '167.00', setor: 'Mesa_posta' },
  { nome: 'Porta Doces com Pé e Cúpula em Vidro', marca: 'Studio Collection', tamanho: '14x17', preco: '156.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 4 Pratos Rasos Aves', marca: 'Maison Blanche', tamanho: '27cm', preco: '810.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 4 Pratos Sobremesa Aves', marca: 'Maison Blanche', tamanho: '20cm', preco: '695.00', setor: 'Mesa_posta' },
  { nome: 'Jarra Itacaré em Cerâmica Linha Coco', marca: 'Maison Blanche', tamanho: '1L', preco: '389.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Pratos Fundos Borboletas em Cerâmica', marca: 'Concept Scala', tamanho: '21,5cm', preco: '290.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Pratos Rasos Borboletas em Cerâmica', marca: 'Concept Scala', tamanho: '27,5cm', preco: '350.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Xícaras com Pires Borboletas em Cerâmica', marca: 'Concept Scala', tamanho: '300ml', preco: '360.00', setor: 'Mesa_posta' },
  { nome: 'Travessa Grande Folha em Porcelana Sommelier', marca: 'Scala', tamanho: '35cm', preco: '188.85', setor: 'Mesa_posta' },
  { nome: 'Fruteira Média Folha Verde Alta em Porcelana', marca: 'Scala', tamanho: '33,5cm', preco: '280.00', setor: 'Mesa_posta' },
  { nome: 'Fruteira Média Folha Rasa em Porcelana', marca: 'Scala', tamanho: '33,5cm', preco: '200.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 36 Peças Jantar em Porcelana Fanci Menta', marca: 'Wolff', preco: '2700.00', setor: 'Mesa_posta' },
  { nome: 'Rechaud Redondo em Cerâmica com Queimador em Cobre', marca: 'Wolff', tamanho: '640g', preco: '780.30', setor: 'Mesa_posta' },
  { nome: 'Aparelho de Fondue 8 Peças em Porcelana e Base de Bambu com Queimador', marca: 'Fracalanza', tamanho: '300ml', preco: '220.00', setor: 'Mesa_posta' },
  { nome: "Conj. de Jantar com 24 Peças em Cerâmica", marca: "L'Hermitage", preco: '1867.00', setor: 'Mesa_posta' },
  { nome: 'Jogo para Sobremesa com 7 Peças em Vidro', marca: "L'Hermitage", tamanho: '1,86L', preco: '279.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Copos Abacaxi em Cerâmica Linha Mauá', marca: 'Scala', preco: '386.00', setor: 'Mesa_posta' },
  { nome: 'Jarra em Cerâmica Marmorizada', marca: 'La Provence Decor', tamanho: '2,0L', preco: '270.00', setor: 'Mesa_posta' },
  { nome: 'Jogo de Jantar 20 Peças em Cristal', marca: 'Wolff', preco: '950.00', setor: 'Mesa_posta' },
  { nome: 'Sopeira em Porcelana Limoges Vendages', marca: 'Wolff', tamanho: '4,0L', preco: '860.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Potes de Vidro Borossilicato com Tampa Hermética', marca: 'Wolff', tamanho: '120ml', preco: '210.00', setor: 'Complementos' },
  { nome: 'Conj. 12 Potes de Vidro Borossilicato Giratório com Tampa Hermética', marca: 'Wolff', tamanho: '120ml', preco: '499.90', setor: 'Complementos' },
  { nome: 'Jogo de 14 Peças para Chá Scarlate em Porcelana', marca: "L'Hermitage", tamanho: 'Bule 1L, Xícaras 350ml', preco: '1424.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 2 Tábuas de Madeira com Mármore', marca: 'Wolff', preco: '650.00', setor: 'Complementos' },
  { nome: 'Conj. 6 Xícaras Chá Porcelana com Pires Birds Branco', marca: 'Wolff', tamanho: '200ml', preco: '570.00', setor: 'Mesa_posta' },
  { nome: 'Jarro de Cerâmica Decorativo', marca: 'La Provence Decor', tamanho: '1L', preco: '449.90', setor: 'Adornos' },
  { nome: 'Xícara com Pires de Cerâmica Decorativa', marca: 'La Provence Decor', tamanho: '200ml', preco: '200.00', setor: 'Adornos' },
  { nome: 'Prato para Bolo com Espátula em Porcelana', marca: "L'Hermitage", preco: '410.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Xícaras para Café em Porcelana Limoges Vendages', marca: 'Wolff', tamanho: '100ml', preco: '579.00', setor: 'Mesa_posta' },
  { nome: 'Moleira em Porcelana Limoges Vendages', marca: 'Wolff', tamanho: '500ml', preco: '140.00', setor: 'Mesa_posta' },
  { nome: 'Leiteira em Porcelana Limoges Vendages', marca: 'Wolff', tamanho: '120ml', preco: '220.00', setor: 'Mesa_posta' },
  { nome: 'Garrafa Térmica em Inox com Ratan', marca: 'Wolff', tamanho: '1,5L', preco: '460.00', setor: 'Complementos' },
  { nome: 'Garrafa Térmica Verde Plástico com Cabo de Madeira', marca: 'Wolff', tamanho: '1,0L', preco: '159.90', setor: 'Complementos' },
  { nome: 'Garrafa Térmica Branco Plástico com Cabo de Madeira', marca: 'Incasa', tamanho: '1,0L', preco: '150.00', setor: 'Complementos' },
  { nome: 'Garrafa Térmica Preto Plástico com Cabo de Madeira', marca: 'Incasa', tamanho: '1,0L', preco: '150.00', setor: 'Complementos' },
  { nome: 'Mantegueira Vidro Base Bambu Bird com Tampa', marca: 'Wolff', preco: '79.90', setor: 'Mesa_posta' },
  { nome: 'Queijeira Vidro Base Bambu Bird com Tampa', marca: 'Wolff', preco: '165.00', setor: 'Mesa_posta' },
  { nome: 'Prato Cristal de Chumbo com Pé e Tampa', marca: 'Wolff', preco: '180.00', setor: 'Mesa_posta' },
  { nome: 'Prato para Bolo de Vidro com Pé e Tampa', marca: 'Wolff', preco: '390.00', setor: 'Mesa_posta' },
  { nome: 'Travessa Oval Vimini em Vidro Borosilicato com Suporte em Rattan', marca: 'Wolff', tamanho: '2,4L', preco: '269.00', setor: 'Mesa_posta' },
  { nome: 'Travessa Retangular em Vidro Borosilicato com Suporte em Rattan', marca: 'Wolff', tamanho: '3,8L', preco: '250.00', setor: 'Mesa_posta' },
  { nome: 'Garrafa Térmica em Prata', marca: 'Sheffield Plate', tamanho: '1,5L', preco: '5393.00', setor: 'Prataria' },
  { nome: 'Boleira com Cúpula em Vidro e Base em Mármore', marca: 'BTC', preco: '940.00', setor: 'Mesa_posta' },
  { nome: 'Balde Gelo Liso em Prata Montpellier', marca: 'Montpellier', tamanho: '2,75L', preco: '3312.00', setor: 'Prataria' },
  { nome: 'Balde Gelo Inox', tamanho: '4,0L', preco: '351.00', setor: 'Complementos' },
  { nome: 'Balde para Champanhe Dourado/Preto Relevo', tamanho: '5,0L', preco: '450.00', setor: 'Complementos' },
  { nome: 'Jarra em Vidro Transparente Ponto Dourado', marca: 'BTC', preco: '350.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Taças Vidro Transparente Ponto Dourado', marca: 'BTC', tamanho: '320ml', preco: '660.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Copos em Vidro Textura Burbujas Âmbar', marca: 'BTC', tamanho: '350ml', preco: '449.00', setor: 'Mesa_posta' },
  { nome: 'Conj. 6 Copos em Vidro Colorido', marca: 'BTC', tamanho: '340ml', preco: '669.00', setor: 'Mesa_posta' },
  { nome: 'Rechaud em Prata com Marinex Retangular', marca: 'Apolo', tamanho: '3L', preco: '4260.00', setor: 'Prataria' },
  { nome: 'Bandeja de Mármore e Metal Gold', preco: '1879.90', setor: 'Adornos' },
  { nome: 'Aparelho de Jantar 42 Peças Porcelana Nice Silver', marca: 'Wolff', preco: '2353.00', setor: 'Mesa_posta' },
  { nome: 'Kit Lavabo 4 Peças em Porcelana', marca: 'BTC', preco: '310.00', setor: 'Complementos' },
  { nome: 'Kit Lavabo 4 Peças em Vidro', marca: 'La Provence Decor', preco: '635.00', setor: 'Complementos' },
  { nome: 'Kit Lavabo 3 Peças Lyra Aquamarine - Porta Sabonete Líquido, Porta Cotonete/Algodão, Porta Escovas', marca: 'Aquamarine', preco: '2580.00', setor: 'Complementos' },
  { nome: 'Bandeja para Lavabo Lyra Aquamarine', marca: 'Aquamarine', preco: '989.00', setor: 'Complementos' },
  { nome: 'Jogo com 4 Facas para Queijo', marca: 'Mabruk', preco: '369.00', setor: 'Mesa_posta' },
  { nome: 'Jogo de 6 Peças para Servir London', marca: 'Wolff', preco: '652.55', setor: 'Mesa_posta' },
  { nome: 'Capa para Almofada 100% Poliéster', marca: 'La Provence Decor', tamanho: '42x42', preco: '175.00', setor: 'Complementos' },
  { nome: 'Capa para Almofada 100% Poliéster', marca: 'La Provence Decor', tamanho: '42x42', preco: '149.90', setor: 'Complementos' },
  { nome: 'Capa para Almofada 100% Poliéster', marca: 'Mabruk', tamanho: '40x40', preco: '150.00', setor: 'Complementos' },
  { nome: 'Conj. 4 Canecas com Pires Madeira Cinza', marca: 'Woodart', tamanho: '115ml', preco: '280.00', setor: 'Mesa_posta' },
  { nome: 'Cesta em Fibra Natural Retangular', marca: 'La Provence Decor', tamanho: '40x19x8', preco: '285.00', setor: 'Complementos' },
]

async function main() {
  console.log(`Inserindo ${items.length} itens no catálogo...`)

  let created = 0
  let failed = 0

  for (const item of items) {
    try {
      await prisma.catalogo.create({
        data: {
          nome: item.nome,
          marca: item.marca ?? null,
          tamanho: item.tamanho ?? null,
          preco: item.preco,
          setor: item.setor as any,
          estoque: 1,
          quantidade: 1,
          status: 'Ativo',
          version: 1,
        },
      })
      created++
      console.log(`✓ ${item.nome}`)
    } catch (err: any) {
      failed++
      console.error(`✗ ${item.nome}: ${err.message}`)
    }
  }

  console.log(`\nConcluído: ${created} criados, ${failed} falhas.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
