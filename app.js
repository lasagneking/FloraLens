const STORAGE_KEY = "floralens.v2";
const PHOTO_DB = "floralens-photos";
const PHOTO_STORE = "photos";

/*
  Set this to your deployed Cloudflare Worker URL after setup, e.g.
  const API_PROXY_URL = "https://floralens-api.yourname.workers.dev";
  Never put your Pl@ntNet API key in this browser file.
*/
const API_PROXY_URL = "https://floralens-api.lrthumwood.workers.dev";
const journalPhotoInput=document.createElement("input");
journalPhotoInput.type="file";
journalPhotoInput.accept="image/*";
journalPhotoInput.setAttribute("capture","environment");
journalPhotoInput.hidden=true;
document.body.appendChild(journalPhotoInput);
let pendingJournalPhotoFile=null;
let pendingJournalPlantId=null;



const FLORALENS_CARE_LIBRARY = {
  "lavandula angustifolia": {
    "commonName": "English lavender",
    "light": "Full sun",
    "water": "Water while establishing; once established, water sparingly and avoid prolonged wet soil.",
    "soil": "Very free-draining soil; neutral to alkaline conditions are usually suitable.",
    "height": "About 40–90 cm, depending on cultivar and conditions",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Woody, aromatic evergreen subshrub",
    "pruning": "Trim after flowering, keeping some green growth below the cut. Avoid cutting hard into old bare wood.",
    "propagation": "Semi-ripe cuttings in summer are usually reliable.",
    "hardiness": "Generally hardy in UK gardens when drainage is good.",
    "seasonal": {
      "spring": "Remove winter damage and tidy lightly once strong new growth is visible.",
      "summer": "Enjoy flowering; trim after the main flush if a compact shape is wanted.",
      "autumn": "Avoid heavy pruning late in the year.",
      "winter": "Protect from waterlogged soil; winter wet is often more troublesome than cold."
    }
  },
  "lavandula": {
    "light": "Full sun",
    "water": "Low to moderate once established; avoid waterlogging.",
    "soil": "Very free-draining soil is important.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Aromatic evergreen or semi-evergreen subshrub",
    "pruning": "Trim after flowering rather than cutting hard into old woody stems.",
    "hardiness": "Varies by species and cultivar; winter drainage is especially important."
  },
  "hydrangea macrophylla": {
    "commonName": "Mophead / lacecap hydrangea",
    "light": "Part shade or gentle sun; shelter from intense drying heat.",
    "water": "Keep evenly moist, especially in warm weather and while establishing.",
    "soil": "Moist but well-drained, humus-rich soil.",
    "height": "Commonly around 1–2 m",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Deciduous flowering shrub",
    "pruning": "Prune lightly in spring, removing old flowerheads and dead wood. Many cultivars flower on older stems, so avoid indiscriminate hard pruning.",
    "propagation": "Softwood cuttings are commonly taken in summer.",
    "hardiness": "Generally hardy in much of the UK; young growth can be damaged by late frost."
  },
  "hydrangea": {
    "light": "Part shade to sun, with more shelter in hotter or drier positions.",
    "water": "Usually prefers consistent moisture.",
    "soil": "Moist but well-drained, humus-rich soil.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Usually a deciduous shrub or climber",
    "hardiness": "Varies by species and cultivar."
  },
  "rosa": {
    "light": "Full sun is best for most roses; some tolerate light shade.",
    "water": "Water deeply in dry spells, especially newly planted roses.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Deciduous flowering shrub or climber",
    "pruning": "Main pruning is usually carried out in the dormant season; technique depends on whether the rose is shrub, climbing or rambling.",
    "propagation": "Hardwood or semi-ripe cuttings can be used; named cultivars may not come true from seed.",
    "hardiness": "Many garden roses are hardy across much of the UK, but cultivar differences matter."
  },
  "salvia rosmarinus": {
    "commonName": "Rosemary",
    "light": "Full sun",
    "water": "Low to moderate once established; avoid persistently wet roots.",
    "soil": "Free-draining soil.",
    "height": "Usually around 0.8–1.5 m, depending on cultivar",
    "bloomMonths": [
      3,
      4,
      5,
      6
    ],
    "growthHabit": "Aromatic evergreen shrub",
    "pruning": "Trim lightly after flowering to keep compact; avoid cutting back into old bare wood.",
    "propagation": "Semi-ripe cuttings root readily in summer.",
    "hardiness": "Generally hardy in sheltered UK gardens with good drainage."
  },
  "rosmarinus officinalis": {
    "commonName": "Rosemary",
    "light": "Full sun",
    "water": "Low to moderate once established; avoid persistently wet roots.",
    "soil": "Free-draining soil.",
    "height": "Usually around 0.8–1.5 m, depending on cultivar",
    "bloomMonths": [
      3,
      4,
      5,
      6
    ],
    "growthHabit": "Aromatic evergreen shrub",
    "pruning": "Trim lightly after flowering to keep compact; avoid cutting back into old bare wood.",
    "propagation": "Semi-ripe cuttings root readily in summer.",
    "hardiness": "Generally hardy in sheltered UK gardens with good drainage."
  },
  "digitalis purpurea": {
    "commonName": "Foxglove",
    "light": "Part shade to sun",
    "water": "Moderate; avoid prolonged drought while establishing.",
    "soil": "Moist but well-drained soil with organic matter.",
    "height": "Often around 1–1.5 m in flower",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Usually biennial or short-lived perennial",
    "pruning": "Remove spent spikes to reduce self-seeding, or leave some if you want naturalised seedlings.",
    "hardiness": "Hardy in UK conditions.",
    "safety": "Toxic if eaten. Avoid ingestion and keep away from pets or young children likely to chew plants."
  },
  "buxus sempervirens": {
    "commonName": "Common box",
    "light": "Sun to shade",
    "water": "Moderate; established plants tolerate some dryness.",
    "soil": "Well-drained soil; avoid persistently waterlogged ground.",
    "height": "Can exceed 2 m untrimmed, but commonly kept much smaller",
    "growthHabit": "Dense evergreen shrub",
    "pruning": "Clip during the growing season for formal shapes, avoiding very hot dry weather.",
    "hardiness": "Hardy in UK gardens.",
    "safety": "All parts are harmful if eaten."
  },
  "acer": {
    "light": "Sun to part shade; many Japanese maples prefer shelter from scorching sun and wind.",
    "water": "Keep evenly moist while establishing; avoid prolonged waterlogging.",
    "soil": "Moist but well-drained soil; many species prefer slightly acidic to neutral conditions.",
    "growthHabit": "Deciduous tree or shrub",
    "hardiness": "Many garden maples are hardy in the UK; exposure tolerance varies by species.",
    "pruning": "Prune only when necessary, generally avoiding heavy pruning during active sap flow."
  },
  "agapanthus": {
    "light": "Full sun",
    "water": "Water regularly in active growth; reduce in winter.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Clump-forming perennial",
    "hardiness": "Hardiness varies; evergreen forms are often less hardy than deciduous forms.",
    "pruning": "Remove spent flower stems and dead foliage as needed."
  },
  "alchemilla": {
    "light": "Sun to part shade",
    "water": "Moderate; established plants cope with short dry spells.",
    "soil": "Most reasonably fertile, well-drained soils.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Low, clump-forming herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut back untidy flowers and foliage after flowering to encourage fresh growth."
  },
  "allium": {
    "light": "Full sun",
    "water": "Moderate during growth; avoid wet dormant soil.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Most ornamental alliums are hardy in UK gardens.",
    "pruning": "Leave foliage to die back naturally after flowering."
  },
  "anemone": {
    "light": "Sun to part shade, depending on species.",
    "water": "Moderate; keep evenly moist during active growth.",
    "soil": "Humus-rich, well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5,
      8,
      9,
      10
    ],
    "growthHabit": "Herbaceous perennial or tuberous plant",
    "hardiness": "Many garden anemones are hardy; species differ."
  },
  "aquilegia": {
    "light": "Sun to part shade",
    "water": "Moderate; avoid prolonged drought.",
    "soil": "Moist but well-drained soil.",
    "bloomMonths": [
      5,
      6
    ],
    "growthHabit": "Short-lived herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut back after flowering if you want to limit self-seeding."
  },
  "astilbe": {
    "light": "Part shade; tolerates sun if soil stays moist.",
    "water": "Likes consistent moisture and dislikes drying out.",
    "soil": "Moist, humus-rich soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Clump-forming herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut old stems to the ground in late winter or early spring."
  },
  "begonia": {
    "light": "Bright shade or gentle sun; avoid harsh midday sun for many types.",
    "water": "Keep moderately moist but not waterlogged.",
    "soil": "Free-draining, humus-rich compost or soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender perennial often grown as an annual",
    "hardiness": "Many bedding and tuberous begonias are frost tender in the UK."
  },
  "bergenia": {
    "light": "Sun to shade",
    "water": "Moderate; established plants are fairly tolerant.",
    "soil": "Moist but well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Evergreen clump-forming perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove damaged leaves and spent flower stems."
  },
  "buddleja": {
    "light": "Full sun",
    "water": "Moderate while establishing; fairly drought tolerant once established.",
    "soil": "Well-drained soil; tolerates relatively poor soils.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Deciduous or semi-evergreen flowering shrub",
    "hardiness": "Many common garden forms are hardy in the UK.",
    "pruning": "Many Buddleja davidii types are cut back hard in early spring; other species differ."
  },
  "camellia": {
    "light": "Part shade or sheltered dappled light",
    "water": "Keep evenly moist, especially during bud formation and dry weather.",
    "soil": "Acidic, humus-rich, well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      5
    ],
    "growthHabit": "Evergreen flowering shrub",
    "hardiness": "Many cultivars are hardy, but flower buds can be damaged by severe frost.",
    "pruning": "Usually needs little pruning; shape after flowering if required."
  },
  "campanula": {
    "light": "Sun to part shade",
    "water": "Moderate; avoid waterlogging.",
    "soil": "Well-drained soil; many tolerate poorer ground.",
    "bloomMonths": [
      5,
      6,
      7,
      8
    ],
    "growthHabit": "Herbaceous or evergreen perennial",
    "hardiness": "Many garden campanulas are hardy.",
    "pruning": "Deadhead or trim after flowering to encourage tidiness and sometimes a second flush."
  },
  "ceanothus": {
    "light": "Full sun in a sheltered position",
    "water": "Moderate while establishing; avoid winter wet.",
    "soil": "Free-draining soil.",
    "bloomMonths": [
      4,
      5,
      6
    ],
    "growthHabit": "Evergreen or deciduous flowering shrub",
    "hardiness": "Hardiness varies; many evergreen types benefit from shelter.",
    "pruning": "Prune lightly after flowering; avoid cutting hard into old wood."
  },
  "choisya": {
    "light": "Sun to part shade",
    "water": "Moderate; water while establishing.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      4,
      5,
      6,
      8,
      9
    ],
    "growthHabit": "Evergreen flowering shrub",
    "hardiness": "Generally hardy in sheltered UK gardens.",
    "pruning": "Trim after flowering if needed; avoid severe pruning unless rejuvenating."
  },
  "clematis": {
    "light": "Sun to part shade; many prefer cool, shaded roots with growth reaching the light.",
    "water": "Water regularly while establishing and during dry spells.",
    "soil": "Deep, fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      4,
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Climbing perennial",
    "hardiness": "Many cultivars are hardy in the UK.",
    "pruning": "Pruning depends on flowering group, so identify the cultivar or group before cutting back heavily."
  },
  "cornus": {
    "light": "Sun to part shade",
    "water": "Moderate; many prefer soil that does not dry out severely.",
    "soil": "Moist but well-drained soil.",
    "growthHabit": "Deciduous shrub or small tree",
    "hardiness": "Many garden dogwoods are hardy.",
    "pruning": "Pruning depends on type: coloured-stem dogwoods are often cut hard in spring, while flowering trees need lighter treatment."
  },
  "cosmos": {
    "light": "Full sun",
    "water": "Moderate; avoid overwatering.",
    "soil": "Well-drained soil; too much fertility can produce leaves at the expense of flowers.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender annual",
    "hardiness": "Frost tender.",
    "pruning": "Deadhead regularly to extend flowering."
  },
  "crocus": {
    "light": "Sun to part shade",
    "water": "Usually needs little extra water once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      9,
      10
    ],
    "growthHabit": "Corm-forming perennial",
    "hardiness": "Most common garden crocuses are hardy.",
    "pruning": "Let foliage die back naturally after flowering."
  },
  "dahlia": {
    "light": "Full sun",
    "water": "Water regularly in dry weather, especially in containers.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tuberous tender perennial",
    "hardiness": "Top growth is frost tender; tubers may need winter protection depending on location and soil.",
    "pruning": "Deadhead often; pinch young plants for bushier growth if desired."
  },
  "delphinium": {
    "light": "Full sun with shelter from strong wind",
    "water": "Keep evenly moist in active growth.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Tall herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut spent flower spikes after the first flush; some plants rebloom later.",
    "safety": "Harmful if eaten; avoid ingestion."
  },
  "dianthus": {
    "light": "Full sun",
    "water": "Moderate; avoid soggy soil.",
    "soil": "Free-draining, neutral to alkaline soil suits many types.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Evergreen or semi-evergreen perennial",
    "hardiness": "Many garden pinks are hardy.",
    "pruning": "Deadhead regularly and trim lightly after flowering."
  },
  "echinacea": {
    "light": "Full sun",
    "water": "Moderate while establishing; reasonably drought tolerant once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Herbaceous perennial",
    "hardiness": "Hardy in most UK gardens if winter drainage is good.",
    "pruning": "Leave seed heads for winter interest or cut down after flowering."
  },
  "erica": {
    "light": "Sun to part shade",
    "water": "Moderate; avoid prolonged drought.",
    "soil": "Usually acidic to neutral and free-draining; exact preference varies by species.",
    "bloomMonths": [
      1,
      2,
      3,
      4,
      8,
      9,
      10,
      11,
      12
    ],
    "growthHabit": "Low evergreen shrub",
    "hardiness": "Many heathers are hardy.",
    "pruning": "Trim lightly after flowering, avoiding old leafless wood."
  },
  "euonymus": {
    "light": "Sun to shade, depending on cultivar.",
    "water": "Moderate; established plants are fairly tolerant.",
    "soil": "Well-drained soil.",
    "growthHabit": "Evergreen or deciduous shrub",
    "hardiness": "Many garden forms are hardy.",
    "pruning": "Trim to shape during the growing season if required."
  },
  "forsythia": {
    "light": "Full sun to part shade",
    "water": "Moderate while establishing.",
    "soil": "Most fertile, well-drained soils.",
    "bloomMonths": [
      3,
      4
    ],
    "growthHabit": "Deciduous flowering shrub",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Prune after flowering, removing some older stems to keep the shrub open."
  },
  "fuchsia": {
    "light": "Part shade or gentle sun, sheltered from drying winds.",
    "water": "Keep evenly moist in active growth.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Shrub or tender perennial",
    "hardiness": "Hardiness varies greatly; many bedding types are frost tender."
  },
  "galanthus": {
    "light": "Part shade to sun before trees leaf out",
    "water": "Usually needs little extra watering in suitable ground.",
    "soil": "Moist but well-drained, humus-rich soil.",
    "bloomMonths": [
      1,
      2,
      3
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Allow foliage to die back naturally."
  },
  "geranium": {
    "light": "Sun to part shade, depending on species.",
    "water": "Moderate; many hardy geraniums tolerate short dry spells once established.",
    "soil": "Most reasonably fertile, well-drained soils.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Clump-forming hardy perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Many hardy geraniums respond well to cutting back after the first flush."
  },
  "helleborus": {
    "light": "Part shade",
    "water": "Moderate; dislikes prolonged waterlogging.",
    "soil": "Humus-rich, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      1,
      2,
      3,
      4
    ],
    "growthHabit": "Evergreen or semi-evergreen perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove damaged old foliage before flowers emerge if needed.",
    "safety": "Harmful if eaten and sap may irritate skin; handle with sensible care."
  },
  "hebe": {
    "light": "Sun to part shade in a sheltered position",
    "water": "Moderate; avoid prolonged waterlogging.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Evergreen shrub",
    "hardiness": "Hardiness varies by cultivar; smaller-leaved forms are often tougher.",
    "pruning": "Trim lightly after flowering; avoid cutting hard into old bare wood."
  },
  "heuchera": {
    "light": "Part shade to sun; darker-leaved cultivars often tolerate more sun.",
    "water": "Moderate; avoid waterlogged crowns.",
    "soil": "Humus-rich, well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8
    ],
    "growthHabit": "Evergreen or semi-evergreen clump-forming perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove old leaves and spent flower stems; lift and replant if crowns become woody."
  },
  "hosta": {
    "light": "Part shade to shade; some cultivars tolerate more sun with adequate moisture.",
    "water": "Keep evenly moist, especially during active growth.",
    "soil": "Moist, fertile, humus-rich soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Herbaceous clump-forming perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove collapsed foliage after frost."
  },
  "ilex": {
    "light": "Sun to shade, depending on species and cultivar.",
    "water": "Moderate while establishing.",
    "soil": "Moist but well-drained soil.",
    "growthHabit": "Evergreen or deciduous shrub or tree",
    "hardiness": "Many hollies are hardy.",
    "pruning": "Prune to shape in late spring or summer if needed.",
    "safety": "Berries can be harmful if eaten in quantity; avoid ingestion."
  },
  "iris": {
    "light": "Full sun for many bearded types; some moisture-loving irises prefer damper sites.",
    "water": "Moderate; needs vary strongly by type.",
    "soil": "Well-drained for bearded iris; moisture-retentive for bog or water irises.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Rhizomatous or bulbous perennial",
    "hardiness": "Many garden irises are hardy.",
    "pruning": "Remove spent flower stems and damaged leaves."
  },
  "jasminum": {
    "light": "Sun to part shade in a sheltered position",
    "water": "Moderate; water during prolonged dry spells while establishing.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      12,
      1,
      2
    ],
    "growthHabit": "Climbing shrub",
    "hardiness": "Hardiness varies by species.",
    "pruning": "Prune after flowering; timing differs between summer- and winter-flowering jasmine."
  },
  "lilium": {
    "light": "Sun to part shade with roots kept cool",
    "water": "Keep evenly moist in active growth but avoid waterlogging.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Many lilies are hardy with good drainage.",
    "pruning": "Remove flower heads after flowering but leave foliage until it yellows.",
    "safety": "Lilies can be extremely dangerous to cats if ingested; keep plants and pollen away from cats."
  },
  "lonicera": {
    "light": "Sun to part shade",
    "water": "Moderate; water during dry spells while establishing.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Climber or shrub",
    "hardiness": "Many honeysuckles are hardy.",
    "pruning": "Pruning depends on flowering time and whether the plant is climbing or shrubby."
  },
  "lupinus": {
    "light": "Full sun",
    "water": "Moderate; avoid waterlogged soil.",
    "soil": "Well-drained soil; many prefer neutral to slightly acidic conditions.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Herbaceous perennial",
    "hardiness": "Hardy in UK gardens with good drainage.",
    "pruning": "Deadhead after flowering for tidiness and possible repeat bloom.",
    "safety": "Seeds and other parts may be harmful if eaten; avoid ingestion."
  },
  "magnolia": {
    "light": "Sun to part shade in a sheltered position",
    "water": "Keep evenly moist while establishing.",
    "soil": "Moist but well-drained, humus-rich soil; many prefer neutral to acidic conditions.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Deciduous or evergreen tree or shrub",
    "hardiness": "Many common magnolias are hardy, but flowers can be frost damaged.",
    "pruning": "Generally needs little pruning; remove damaged or crossing branches after flowering if required."
  },
  "narcissus": {
    "light": "Sun to part shade",
    "water": "Usually needs little extra water in open ground.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      5
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Let foliage die back naturally for several weeks after flowering.",
    "safety": "Bulbs and plant parts are harmful if eaten; avoid ingestion."
  },
  "nepeta": {
    "light": "Full sun",
    "water": "Low to moderate once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Aromatic herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut back after the first flush to encourage fresh growth and often more flowers."
  },
  "paeonia": {
    "light": "Full sun to light shade",
    "water": "Moderate; avoid prolonged waterlogging.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6
    ],
    "growthHabit": "Herbaceous perennial or deciduous shrub",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Herbaceous peonies are cut down after foliage dies back; tree peonies need only light pruning."
  },
  "pelargonium": {
    "light": "Full sun to bright light",
    "water": "Water when the top of the compost begins to dry; avoid waterlogging.",
    "soil": "Free-draining compost or soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender perennial often grown as bedding or in containers",
    "hardiness": "Frost tender in the UK.",
    "pruning": "Deadhead regularly and trim back leggy growth."
  },
  "penstemon": {
    "light": "Full sun to part shade",
    "water": "Moderate; avoid winter waterlogging.",
    "soil": "Fertile, free-draining soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Semi-evergreen or herbaceous perennial",
    "hardiness": "Many cultivars are reasonably hardy in sheltered UK gardens.",
    "pruning": "Leave top growth over winter, then cut back in spring when new shoots are visible."
  },
  "petunia": {
    "light": "Full sun",
    "water": "Water regularly, especially in containers.",
    "soil": "Fertile, well-drained compost or soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender annual or short-lived perennial",
    "hardiness": "Frost tender.",
    "pruning": "Deadhead and trim straggly growth to encourage repeat flowering."
  },
  "phlox": {
    "light": "Full sun to part shade",
    "water": "Moderate; keep taller border types evenly moist.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Herbaceous or evergreen perennial",
    "hardiness": "Many garden phlox are hardy.",
    "pruning": "Deadhead after flowering; cut herbaceous stems down after they die back."
  },
  "pieris": {
    "light": "Part shade with shelter from cold drying winds",
    "water": "Keep evenly moist, especially while establishing.",
    "soil": "Acidic, humus-rich, well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Evergreen shrub",
    "hardiness": "Generally hardy in sheltered UK gardens.",
    "pruning": "Usually needs little pruning; remove damaged growth after flowering."
  },
  "primula": {
    "light": "Part shade to gentle sun",
    "water": "Likes consistent moisture, especially in spring.",
    "soil": "Humus-rich, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      5
    ],
    "growthHabit": "Herbaceous or evergreen perennial",
    "hardiness": "Many primulas are hardy.",
    "pruning": "Deadhead and remove old leaves as needed."
  },
  "rhododendron": {
    "light": "Part shade or dappled light",
    "water": "Keep evenly moist, especially during dry spells.",
    "soil": "Acidic, humus-rich, well-drained soil.",
    "bloomMonths": [
      4,
      5,
      6
    ],
    "growthHabit": "Evergreen or deciduous flowering shrub",
    "hardiness": "Many cultivars are hardy; exposure tolerance varies.",
    "pruning": "Usually needs little pruning; deadhead carefully and shape after flowering if needed.",
    "safety": "Plant parts can be harmful if eaten; avoid ingestion."
  },
  "rudbeckia": {
    "light": "Full sun",
    "water": "Moderate; established plants tolerate short dry spells.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Herbaceous perennial or annual",
    "hardiness": "Many perennial forms are hardy.",
    "pruning": "Deadhead to extend flowering, or leave seed heads for winter interest."
  },
  "salvia": {
    "light": "Full sun",
    "water": "Moderate; many shrubby and Mediterranean types prefer drier conditions once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Herbaceous or shrubby perennial",
    "hardiness": "Hardiness varies widely by species and cultivar.",
    "pruning": "Pruning varies by type; many hardy salvias are cut back in spring rather than autumn."
  },
  "sedum": {
    "light": "Full sun",
    "water": "Low once established.",
    "soil": "Free-draining soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Succulent perennial",
    "hardiness": "Many hardy sedums are reliable in UK gardens.",
    "pruning": "Cut old stems in late winter or spring if not left for winter structure."
  },
  "hylotelephium": {
    "light": "Full sun",
    "water": "Low to moderate once established.",
    "soil": "Free-draining soil.",
    "bloomMonths": [
      8,
      9,
      10
    ],
    "growthHabit": "Succulent herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut old stems in late winter or early spring."
  },
  "skimmia": {
    "light": "Part shade to shade",
    "water": "Moderate; dislikes drying out severely.",
    "soil": "Humus-rich, moist but well-drained, preferably acidic to neutral soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Compact evergreen shrub",
    "hardiness": "Hardy in sheltered UK gardens.",
    "pruning": "Usually needs little pruning; lightly shape after flowering if necessary."
  },
  "spiraea": {
    "light": "Full sun to part shade",
    "water": "Moderate while establishing.",
    "soil": "Most fertile, well-drained soils.",
    "bloomMonths": [
      4,
      5,
      6,
      7,
      8
    ],
    "growthHabit": "Deciduous flowering shrub",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Pruning timing depends on whether it flowers on old or new wood."
  },
  "syringa": {
    "light": "Full sun",
    "water": "Moderate; avoid prolonged waterlogging.",
    "soil": "Fertile, well-drained soil, often neutral to alkaline.",
    "bloomMonths": [
      4,
      5,
      6
    ],
    "growthHabit": "Deciduous flowering shrub or small tree",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Prune immediately after flowering if needed; remove suckers from grafted plants."
  },
  "tulipa": {
    "light": "Full sun",
    "water": "Moderate during active growth; relatively dry during summer dormancy.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Bulbs are generally hardy, but some cultivars perform best when replanted annually.",
    "pruning": "Remove spent flowers but leave foliage until it yellows."
  },
  "verbena": {
    "light": "Full sun",
    "water": "Moderate; drought tolerance varies by type.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Annual or perennial flowering plant",
    "hardiness": "Hardiness varies; Verbena bonariensis often survives in free-draining sheltered sites.",
    "pruning": "Deadhead or cut back after flowering; protect crowns from severe winter wet where marginal."
  },
  "viburnum": {
    "light": "Sun to part shade",
    "water": "Moderate; many prefer soil that does not dry out severely.",
    "soil": "Moist but well-drained soil.",
    "bloomMonths": [
      1,
      2,
      3,
      4,
      5,
      11,
      12
    ],
    "growthHabit": "Evergreen or deciduous shrub",
    "hardiness": "Many garden viburnums are hardy.",
    "pruning": "Prune after flowering if needed; timing varies by species."
  },
  "wisteria": {
    "light": "Full sun for best flowering",
    "water": "Water regularly while establishing and during dry spells.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Vigorous woody climber",
    "hardiness": "Hardy in many UK gardens.",
    "pruning": "Usually pruned twice yearly: shortening new growth in summer and again in winter."
  },
  "zinnia": {
    "light": "Full sun",
    "water": "Water at the base when needed; avoid keeping foliage constantly wet.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender annual",
    "hardiness": "Frost tender.",
    "pruning": "Deadhead regularly to prolong flowering."
  },
  "fatsia": {
    "light": "Part shade to shade; shelter from cold drying winds.",
    "water": "Moderate; keep evenly moist while establishing.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "growthHabit": "Evergreen architectural shrub",
    "hardiness": "Generally hardy in sheltered UK gardens.",
    "pruning": "Remove damaged leaves or reduce overlong stems in spring if needed."
  },
  "monstera": {
    "light": "Bright indirect light",
    "water": "Water when the upper compost has begun to dry; do not leave roots waterlogged.",
    "soil": "Airy, free-draining houseplant compost.",
    "growthHabit": "Evergreen climbing houseplant",
    "hardiness": "Tender; protect from cold.",
    "safety": "Plant sap and tissues can irritate and are harmful if chewed; keep away from pets and young children likely to bite plants."
  },
  "ficus": {
    "light": "Bright indirect light; avoid sudden major changes in position.",
    "water": "Allow the upper compost to dry slightly between waterings.",
    "soil": "Free-draining houseplant compost.",
    "growthHabit": "Evergreen houseplant, shrub or tree",
    "hardiness": "Tender indoors in the UK.",
    "pruning": "Prune lightly in active growth if shaping is needed."
  },
  "dracaena": {
    "light": "Bright indirect light; many tolerate lower light.",
    "water": "Allow the top portion of compost to dry before watering again.",
    "soil": "Free-draining houseplant compost.",
    "growthHabit": "Evergreen cane-forming houseplant",
    "hardiness": "Tender indoors in the UK.",
    "safety": "Some Dracaena species can be harmful to pets if chewed."
  },
  "spathiphyllum": {
    "light": "Bright indirect light to moderate shade",
    "water": "Keep lightly moist but not waterlogged; allow the surface to dry a little between waterings.",
    "soil": "Moisture-retentive but free-draining houseplant compost.",
    "growthHabit": "Evergreen clump-forming houseplant",
    "hardiness": "Tender indoors in the UK.",
    "safety": "Plant tissues can irritate the mouth if chewed; keep away from pets and young children likely to bite plants."
  }
};

function floralensCareMatches(scientificName=""){
  const n=String(scientificName).toLowerCase().trim();
  const exact=FLORALENS_CARE_LIBRARY[n] ? {...FLORALENS_CARE_LIBRARY[n], source:"FloraLens care library · species guidance", matchLevel:"species"} : null;
  const genus=n.split(/\s+/)[0];
  const genusCare=genus && FLORALENS_CARE_LIBRARY[genus]
    ? {...FLORALENS_CARE_LIBRARY[genus], source:"FloraLens care library · genus guidance", matchLevel:"genus"}
    : null;
  return {exact,genus:genusCare};
}

function floralensCareFor(scientificName=""){
  const m=floralensCareMatches(scientificName);
  return m.exact||m.genus||null;
}



function seasonKey(){
  const m=new Date().getMonth()+1;
  if([3,4,5].includes(m)) return "spring";
  if([6,7,8].includes(m)) return "summer";
  if([9,10,11].includes(m)) return "autumn";
  return "winter";
}

function usable(v){
  if(v===null||v===undefined||v==="") return null;
  const s=String(v).trim();
  if(!s) return null;
  if(["not available","care detail not yet available","gathering botanical notes…","gathering botanical notes..."].includes(s.toLowerCase())) return null;
  return v;
}

function perenualHeight(p){
  if(!p || (p.dimensionMin===null && p.dimensionMax===null)) return null;
  const unit=p.dimensionUnit||"";
  if(p.dimensionMin!==null && p.dimensionMax!==null) return `${p.dimensionMin}–${p.dimensionMax} ${unit}`.trim();
  const v=p.dimensionMax ?? p.dimensionMin;
  return `${v} ${unit}`.trim();
}
function perenualSun(p){
  if(!p?.sunlight?.length) return null;
  return p.sunlight.map(x=>String(x).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())).join(" · ");
}
function perenualWater(p){
  if(!p) return null;
  if(p.wateringGeneralBenchmark?.value && p.wateringGeneralBenchmark?.unit)
    return `${p.watering || "Water"} · about every ${p.wateringGeneralBenchmark.value} ${p.wateringGeneralBenchmark.unit}`;
  return usable(p.watering);
}
function perenualSoil(p){
  return p?.soil?.length ? p.soil.join(" · ") : null;
}
function perenualHardiness(p){
  if(!p || (p.hardinessMin===null && p.hardinessMax===null)) return null;
  if(p.hardinessMin!==null && p.hardinessMax!==null) return `USDA zones ${p.hardinessMin}–${p.hardinessMax}`;
  return `USDA zone ${p.hardinessMin ?? p.hardinessMax}`;
}
function floweringSeasonMonths(season){
  const s=String(season||"").toLowerCase();
  if(s.includes("spring")) return [3,4,5];
  if(s.includes("summer")) return [6,7,8];
  if(s.includes("autumn")||s.includes("fall")) return [9,10,11];
  if(s.includes("winter")) return [12,1,2];
  return [];
}


function plantAtlasPhenology(scientificName=""){
  const db=window.FLORALENS_PHENOLOGY;
  if(!db) return null;
  const key=String(scientificName||"").replace(/[×]/g,"x").replace(/\s+/g," ").trim().toLowerCase();
  const row=db[key];
  if(!row) return null;
  const months=(start,end)=>{
    start=Number(start);end=Number(end);
    if(!Number.isFinite(start)||!Number.isFinite(end)||start<1||start>12||end<1||end>12)return [];
    const out=[];let m=start;
    for(let i=0;i<12;i++){out.push(m);if(m===end)break;m=m===12?1:m+1;}
    return out;
  };
  return {flowerStart:row[0]??null,flowerEnd:row[1]??null,leafStart:row[2]??null,leafEnd:row[3]??null,
    flowerNote:row[4]||null,leafNote:row[5]||null,vernacular:row[6]||null,
    bloomMonths:months(row[0],row[1]),leafMonths:months(row[2],row[3]),source:"Plant Atlas 2020"};
}
function monthNameShort(m){return ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m)]||"";}
function plantAtlasSeasonText(pa){
  if(!pa?.bloomMonths?.length)return null;
  const now=new Date().getMonth()+1;
  const range=pa.flowerStart===pa.flowerEnd?monthNameShort(pa.flowerStart):`${monthNameShort(pa.flowerStart)}–${monthNameShort(pa.flowerEnd)}`;
  if(pa.bloomMonths.includes(now))
    return `Plant Atlas records this species flowering in Britain and Ireland from ${range}. ${monthNameShort(now)} falls inside that flowering window.${pa.flowerNote?` ${pa.flowerNote}`:""}`;
  const next=pa.bloomMonths.find(m=>m>now)||pa.bloomMonths[0];
  return `Plant Atlas records this species flowering in Britain and Ireland from ${range}. Its next recorded flowering month is ${monthNameShort(next)}.${pa.flowerNote?` ${pa.flowerNote}`:""}`;
}

const TRY_V7_BASE="try-v7";
const tryV7Shards=new Map();
function normaliseScientificName(name=""){
  return String(name||"").replace(/[×]/g,"x").replace(/\s+/g," ").trim();
}
function tryV7ShardLetter(scientificName=""){
  const c=normaliseScientificName(scientificName).charAt(0).toLowerCase();
  return /^[a-z]$/.test(c)?c:null;
}
function tryV7LookupCandidates(scientificName=""){
  const exact=normaliseScientificName(scientificName);
  if(!exact) return [];
  const exactParts=exact.split(/\s+/).filter(Boolean);
  const out=[{name:exact,matchLevel:exactParts.length===1?"genus":"species"}];
  const withoutCultivar=exact.replace(/\s+['"“”][^'"“”]+['"“”](?:\s.*)?$/u,"").trim();
  const parts=withoutCultivar.split(/\s+/).filter(Boolean);
  let binomial=null;
  if(parts.length>=2 && /^[A-Za-z][A-Za-z.-]*$/.test(parts[0])){
    if(parts[1].toLowerCase()==="x" && parts[2] && /^[A-Za-z][A-Za-z.-]*$/.test(parts[2])) binomial=`${parts[0]} x ${parts[2]}`;
    else if(/^[a-z][A-Za-z.-]*$/.test(parts[1])) binomial=`${parts[0]} ${parts[1]}`;
  }
  if(binomial && normaliseScientificName(binomial).toLowerCase()!==exact.toLowerCase()) out.push({name:binomial,matchLevel:"species"});
  const genus=parts[0]||exact.split(/\s+/)[0];
  if(genus && /^[A-Za-z][A-Za-z.-]*$/.test(genus)) out.push({name:genus,matchLevel:"genus"});
  const seen=new Set();
  return out.filter(x=>{const k=normaliseScientificName(x.name).toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});
}
function findTryV7Match(db,scientificName=""){
  if(!db) return null;
  const index=new Map(Object.entries(db).map(([name,row])=>[normaliseScientificName(name).toLowerCase(),{name,row}]));
  for(const candidate of tryV7LookupCandidates(scientificName)){
    const hit=index.get(normaliseScientificName(candidate.name).toLowerCase());
    if(hit) return {data:hit.row,matchedName:hit.name,matchLevel:candidate.matchLevel,dataset:"TRY v7"};
  }
  return null;
}
function persistedTryV7Match(scientificName="",speciesKey=null){
  const keys=[speciesKey,slug(scientificName)].filter(Boolean);
  for(const key of keys){
    const hit=state?.speciesCache?.[key]?.tryV7;
    if(hit?.data) return hit;
  }
  const wanted=normaliseScientificName(scientificName).toLowerCase();
  for(const entry of Object.values(state?.speciesCache||{})){
    if(normaliseScientificName(entry?.scientific||"").toLowerCase()===wanted && entry?.tryV7?.data) return entry.tryV7;
  }
  return null;
}
function cachedTryV7Record(scientificName="",speciesKey=null){
  const persisted=persistedTryV7Match(scientificName,speciesKey);
  if(persisted) return persisted;
  const letter=tryV7ShardLetter(scientificName), promise=letter&&tryV7Shards.get(letter);
  if(!promise?.__resolved) return null;
  return findTryV7Match(promise.__resolved,scientificName);
}
function persistTryV7Match(scientificName,speciesKey,match){
  if(!match?.data) return false;
  const key=speciesKey||slug(scientificName);
  const current=state.speciesCache[key]||{scientific:scientificName};
  const next={data:match.data,matchedName:match.matchedName,matchLevel:match.matchLevel,dataset:"TRY v7",cachedAt:new Date().toISOString()};
  const old=current.tryV7;
  const same=old && old.matchedName===next.matchedName && old.matchLevel===next.matchLevel && JSON.stringify(old.data)===JSON.stringify(next.data);
  if(same) return false;
  state.speciesCache[key]={...current,scientific:current.scientific||scientificName,tryV7:next};
  return true;
}
// Wrap shard promises so synchronous care rendering can reuse already-loaded data.
async function preloadTryV7(scientificName="",speciesKey=null){
  const persisted=persistedTryV7Match(scientificName,speciesKey);
  if(persisted) return persisted;
  const letter=tryV7ShardLetter(scientificName);
  if(!letter) return null;
  if(!tryV7Shards.has(letter)){
    const promise=(async()=>{try{const res=await fetch(`${TRY_V7_BASE}/try-${letter}.json`);if(!res.ok)throw new Error(`TRY v7 shard ${letter.toUpperCase()} failed (${res.status})`);return await res.json();}catch(err){console.warn("TRY v7 load failed",err);return {};}})();
    tryV7Shards.set(letter,promise);
    promise.then(db=>{promise.__resolved=db;});
  }
  const promise=tryV7Shards.get(letter), db=await promise;
  promise.__resolved=db;
  const match=findTryV7Match(db,scientificName);
  if(match && persistTryV7Match(scientificName,speciesKey,match)) saveState();
  return match;
}
function traitRecordFor(scientificName="",speciesKey=null){
  const v7=cachedTryV7Record(scientificName,speciesKey);
  if(v7?.data) return {
    ...v7.data,
    heightM:v7.data.heightEstimateM??null,
    habitat:v7.data.habitat||v7.data.vegetation||null,
    matchLevel:v7.matchLevel||"species",
    matchedName:v7.matchedName||v7.data.name||scientificName,
    dataset:"TRY v7"
  };
  // Legacy TRY Archive 81 remains a genus/species fallback if v7 has no usable record.
  const db=window.FLORALENS_TRAITS;
  if(!db) return null;
  const n=normaliseScientificName(scientificName).toLowerCase();
  let row=db.species?.[n]; let level="species";
  if(!row){ const genus=n.split(" ")[0]; row=db.genera?.[genus]; level="genus"; }
  if(!row) return null;
  return {growthForm:row[0]||null,woodiness:row[1]||null,succulence:row[2]||null,habitat:row[3]||null,leafType:row[4]||null,heightM:row[5]??null,matchLevel:level,dataset:"TRY Archive 81"};
}
function prettyTrait(v){
  if(!usable(v)) return null;
  const raw=String(v).trim();
  const upper=raw.toUpperCase();
  if(upper==="W") return "Woody";
  if(upper==="NW") return "Non-woody";
  if(/^[A-Z]$/.test(raw) || /^\d+(?:\.\d+)?$/.test(raw) || ["TMP","BOR","FREEZINGEXPOSED"].includes(upper)) return null;
  return raw.replaceAll("_"," ").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/\b\w/g,c=>c.toUpperCase());
}
function prettyObjectValues(obj,labelMap={}){
  if(!obj || typeof obj!=="object" || Array.isArray(obj)) return null;
  const bits=[];
  for(const [k,v] of Object.entries(obj)){
    const pv=prettyTrait(v);
    if(!pv) continue;
    const label=labelMap[k]||k.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
    bits.push(`${label}: ${pv}`);
  }
  return bits.length?bits.join(" · "):null;
}
function formatEllenberg(v){
  if(!v || typeof v!=="object") return null;
  const labels={light:"Light",moisture:"Moisture",reaction:"Soil reaction",temperature:"Temperature",nitrogen:"Nitrogen",continentality:"Continentality",salinity:"Salinity"};
  const bits=Object.entries(v).filter(([,x])=>Number.isFinite(Number(x))).map(([k,x])=>`${labels[k]||k}: ${Number(x)}`);
  return bits.length?bits.join(" · "):null;
}
function traitHeight(tr){
  if(!tr?.heightM) return null;
  const h=Number(tr.heightM); if(!Number.isFinite(h)||h<=0) return null;
  if(h<1) return `TRY height estimate about ${Math.round(h*100)} cm`;
  return `TRY height estimate about ${h.toFixed(h<10?1:0)} m`;
}
function traitCareInference(tr){
  if(!tr) return {};
  const gf=String(tr.growthFormDetailed||tr.growthForm||"").toLowerCase(), succ=String(tr.succulence||"").toLowerCase(), hab=String(tr.habitat||"").toLowerCase();
  let water=null,soil=null;
  if(hab.includes("aquatic")){ water="Moisture-loving / aquatic growth strategy indicated by TRY traits."; soil="Keep consistently wet or aquatic as appropriate to the identified species."; }
  else if(succ){ water="Succulent growth suggests conservative watering; let the growing medium drain well between waterings."; soil="A free-draining growing medium is a sensible starting point for this succulent growth form."; }
  else if(gf.includes("fern")){ water="Fern growth form generally points to avoiding prolonged drought; exact moisture needs vary by species."; soil="Moisture-retentive but aerated organic soil is a cautious starting point; verify species-specific needs."; }
  else if(gf.includes("tree")||gf.includes("shrub")){ water="Water regularly while establishing; established requirements depend on species and site."; soil="Well-drained garden soil is a general starting point; acidity and fertility remain species-specific."; }
  else if(gf.includes("herbaceous")){ water="Moderate, even moisture during active growth is a general starting point; adjust for the species and weather."; soil="A reasonably fertile, well-drained garden soil suits many herbaceous plants; verify species-specific exceptions."; }
  return {water,soil};
}
// When Google says "limit reached" or the credit is empty, background work pauses
// until the time Google gives, instead of trying plant after plant.
function noteGeminiPause(data){
  const secs=Number(data?.retryAfter);
  const wait=Number.isFinite(secs)&&secs>0?secs:(data?.error&&/credit/i.test(data.error)?3600:300);
  state.geminiPausedUntil=new Date(Date.now()+Math.min(wait,24*3600)*1000).toISOString();
  saveState();
}
function clearGeminiPause(){ if(state.geminiPausedUntil){ state.geminiPausedUntil=null; saveState(); setTimeout(fillGardenGaps,3000); } }
function geminiPaused(){
  return !!state.geminiPausedUntil && Date.now()<new Date(state.geminiPausedUntil).getTime();
}

/* ===================== Gemini gap-filler =====================
   Real sources always win. Gemini is asked once per species, only for the
   fields every other source left empty, and its answers are tagged "✦ Gemini". */
const GEMINI_FILL_FIELDS=["light","water","soil","height","hardiness","growthHabit","growthRate","pruning","propagation","safety"];
const geminiFillInFlight=new Set();
function geminiCacheFor(sci,key){
  return (key&&state.speciesCache?.[key]) || Object.values(state.speciesCache||{}).find(x=>x?.scientific===sci) || null;
}
function geminiFieldsFor(sci,key){ return geminiCacheFor(sci,key)?.gemini?.fields||{}; }
// Gemini details are credited once, in Botany → "Where this record comes from", not on each box.
function gmTag(){ return ""; }
function geminiFieldList(care,hasDesc){
  const names={light:"light",water:"watering",soil:"soil",height:"size",hardiness:"hardiness",growthHabit:"growth form",growthRate:"growth rate",
    pruning:"pruning",propagation:"propagation",safety:"safety",bloomMonths:"flowering months"};
  const list=[...(care?.geminiFilled||[]).map(k=>names[k]||k),...(hasDesc?["the description"]:[])];
  return list.length<2?list.join(""):`${list.slice(0,-1).join(", ")} or ${list.at(-1)}`;
}
function careGapsFor(p){
  const intel=state.speciesCache[p.speciesKey]?.enrichment||null;
  const care=resolvedCare(p.scientific,intel?.trefle||null,intel?.perenual||null,p.speciesKey,{noGemini:true});
  const missing=GEMINI_FILL_FIELDS.filter(k=>!care[k]);
  if(!care.bloomMonths?.length) missing.push("bloomMonths");
  if(!chooseProfileDescription({pn:intel?.perenual,t:intel?.trefle,g:intel?.gbif,p})) missing.push("description");
  const known={};
  GEMINI_FILL_FIELDS.forEach(k=>{ if(care[k]) known[k]=String(care[k]).slice(0,300); });
  if(care.bloomMonths?.length) known.bloomMonths=care.bloomMonths;
  return {missing,known};
}
async function fillGapsWithGemini(p,{force=false}={}){
  fillGapsWithGemini.lastCalled=false;
  if(!API_PROXY_URL||!p?.speciesKey||!navigator.onLine||geminiPaused()) return false;
  const cache=state.speciesCache[p.speciesKey]; if(!cache) return false;
  const g=cache.gemini;
  if(!force && g?.fetchedAt) return false;                                        // once per species
  if(!force && g?.failedAt && Date.now()-new Date(g.failedAt).getTime()<20*60e3) return false;
  if(geminiFillInFlight.has(p.speciesKey)) return false;
  const {missing,known}=careGapsFor(p);
  if(!missing.length) return false;
  geminiFillInFlight.add(p.speciesKey);
  fillGapsWithGemini.lastCalled=true;
  try{
    const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/fill`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({scientific:p.scientific,common:p.common,family:p.family||cache.family||"",missing,known})});
    const data=await res.json().catch(()=>null);
    if(res.status===429||res.status===402){ noteGeminiPause(data); return false; }
    if(!res.ok||!data?.fields) throw new Error(data?.error||`Gap fill failed (${res.status})`);
    const fields={};
    for(const k of missing){
      const v=data.fields[k];
      if(k==="bloomMonths"){
        const months=[...new Set((Array.isArray(v)?v:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=12))].sort((a,b)=>a-b);
        if(months.length&&months.length<12) fields.bloomMonths=months;
      }else if(typeof v==="string"&&v.trim()&&!/^(unknown|n\/a|none|not known)\.?$/i.test(v.trim())){
        fields[k]=v.trim().slice(0,k==="description"?900:500);
      }
    }
    state.speciesCache[p.speciesKey]={...state.speciesCache[p.speciesKey],gemini:{fields,asked:missing,fetchedAt:new Date().toISOString(),model:data.model||"gemini"}};
    saveState();
    syncPlantsFromSpecies(p.speciesKey);
    return Object.keys(fields).length>0;
  }catch(err){
    console.warn("Gemini gap fill",err);
    state.speciesCache[p.speciesKey]={...state.speciesCache[p.speciesKey],gemini:{...(g||{}),failedAt:new Date().toISOString()}};
    saveState();
    return false;
  }finally{ geminiFillInFlight.delete(p.speciesKey); }
}
// Called after a profile renders. Older entries may never have had their botanical
// lookup, so run that first; then let Gemini fill whatever is still blank.
async function maybeFillGaps(p){
  if(!p?.speciesKey||!API_PROXY_URL||!navigator.onLine) return;
  if(!state.speciesCache[p.speciesKey]){
    state.speciesCache[p.speciesKey]={scientific:p.scientific,common:p.common,family:p.family||"",source:"FloraLens",fetchedAt:new Date().toISOString(),enrichment:null};
    saveState();
  }
  const cache=state.speciesCache[p.speciesKey];
  let enriched=false;
  if(!cache.enrichment && !cache.enrichmentError){
    enriched=!!(await enrichSpecies(p.scientific,p.speciesKey).catch(()=>null));
  }
  const filled=await fillGapsWithGemini(p);
  if(!(enriched||filled)) return;
  if(currentRoute==="profile" && document.querySelector(`[data-profile-id="${p.id}"]`)){
    const tab=document.querySelector(".profile-tab.active")?.dataset.profileTab;
    const y=appScrollTop();
    await renderProfile(p.id);
    if(tab) setProfileTab(tab);
    appScrollTo(y);
    const n=filled?Object.keys(state.speciesCache[p.speciesKey]?.gemini?.fields||{}).length:0;
    toast(n?`Gemini filled ${n} missing detail${n===1?"":"s"}`:"Botanical notes added");
  }
}

function resolvedCare(scientificName,t,pn,speciesKey=null,opts={}){
  const gm=opts.noGemini?{}:geminiFieldsFor(scientificName,speciesKey);
  const filled=[];
  const gmFallback=(k,v)=>{ if(v) return v; const g=usable(gm[k]); if(g){ filled.push(k); return g; } return null; };
  const pa=plantAtlasPhenology(scientificName);
  const tr=traitRecordFor(scientificName,speciesKey);
  const inferred=traitCareInference(tr);
  const localMatches=floralensCareMatches(scientificName);
  const exactLocal=localMatches.exact;
  const genusLocal=localMatches.genus;
  const local=exactLocal||genusLocal;
  const trefleSoil = t ? usable(soilLabel(t)) : null;

  const pCare={
    light: usable(perenualSun(pn)), water: usable(perenualWater(pn)), soil: usable(perenualSoil(pn)), height: usable(perenualHeight(pn)),
    bloomMonths: floweringSeasonMonths(pn?.floweringSeason), growthHabit: usable(pn?.type), growthRate: usable(pn?.growthRate), hardiness: usable(perenualHardiness(pn)),
    safety: pn?.poisonousToHumans===true || pn?.poisonousToPets===true ? `Recorded as poisonous${pn.poisonousToHumans===true?" to humans":""}${pn.poisonousToHumans===true&&pn.poisonousToPets===true?" and":""}${pn.poisonousToPets===true?" to pets":""}.` : null
  };
  const tCare={
    light: t?.light!==null && t?.light!==undefined ? usable(lightLabel(t.light)) : null,
    water: t?.soilHumidity!==null && t?.soilHumidity!==undefined ? usable(moistureLabel(t.soilHumidity)) : null,
    soil: trefleSoil,
    height: t && (t.averageHeightCm||t.maximumHeightCm) ? usable(formatHeight(t.averageHeightCm,t.maximumHeightCm)) : null,
    bloomMonths: t?.bloomMonths?.length ? monthsToNumbers(t.bloomMonths) : [],
    growthHabit: usable(t?.growthHabit), growthRate: usable(t?.growthRate),
    hardiness: t?.minimumTemperatureC!==null && t?.minimumTemperatureC!==undefined ? `Recorded minimum temperature ${t.minimumTemperatureC}°C` : null,
    safety: toxicityCopy(t)
  };
  const traitFields={
    water:usable(inferred.water), soil:usable(inferred.soil), height:usable(traitHeight(tr)),
    growthHabit:usable(prettyTrait(tr?.growthFormDetailed)||prettyTrait(tr?.growthForm))
  };
  const pick=(k)=>gmFallback(k, usable(exactLocal?.[k]) || usable(pCare[k]) || usable(tCare[k]) || usable(genusLocal?.[k]) || usable(traitFields[k]) || null);
  const bloom = pa?.bloomMonths?.length ? pa.bloomMonths : exactLocal?.bloomMonths?.length ? exactLocal.bloomMonths : pCare.bloomMonths?.length ? pCare.bloomMonths : tCare.bloomMonths?.length ? tCare.bloomMonths : genusLocal?.bloomMonths?.length ? genusLocal.bloomMonths : tr?.floweringMonths?.length ? monthsToNumbers(tr.floweringMonths) : [];
  const bloomFinal = bloom?.length ? bloom : (Array.isArray(gm.bloomMonths)&&gm.bloomMonths.length ? (filled.push("bloomMonths"), gm.bloomMonths) : bloom);
  return {
    light:pick("light"), water:pick("water"), soil:pick("soil"), height:pick("height"), bloomMonths:bloomFinal,
    growthHabit:pick("growthHabit"), growthRate:pick("growthRate"), pruning:gmFallback("pruning",usable(exactLocal?.pruning)||usable(genusLocal?.pruning)), propagation:gmFallback("propagation",usable(exactLocal?.propagation)||usable(genusLocal?.propagation)), hardiness:pick("hardiness"),
    safety:gmFallback("safety",usable(exactLocal?.safety)||pCare.safety||tCare.safety||usable(genusLocal?.safety)), seasonal:exactLocal?.seasonal||genusLocal?.seasonal||null,
    plantAtlas:pa, localSource:local?.source||null, localMatchLevel:local?.matchLevel||null,
    usedPerenual:!!pn && Object.values(pCare).some(v=>Array.isArray(v)?v.length:!!v), usedTrefle:!!t && Object.values(tCare).some(v=>Array.isArray(v)?v.length:!!v), usedLocal:!!local,
    usedTraits:!!tr, traitMatchLevel:tr?.matchLevel||null, traitMatchedName:tr?.matchedName||null,
    traitGrowthFormDetailed:prettyTrait(tr?.growthFormDetailed), traitWoodiness:prettyTrait(tr?.woodiness), traitLeafType:prettyTrait(tr?.leafType), traitHabitat:prettyTrait(tr?.habitat), traitSucculence:prettyTrait(tr?.succulence),
    traitLifeHistory:prettyTrait(tr?.lifeHistory), traitLeafPhenology:prettyTrait(tr?.leafPhenology), traitFlowerColour:prettyTrait(tr?.flowerColour),
    traitSoilPH:tr?.soilPH||null, traitTolerances:prettyObjectValues(tr?.tolerances), traitClimate:prettyTrait(tr?.climate), traitVegetation:prettyTrait(tr?.vegetation),
    traitEllenberg:formatEllenberg(tr?.ellenberg), traitSubstrate:prettyTrait(tr?.substrate), traitNutrientContext:prettyTrait(tr?.nutrientContext), traitSoilMoistureContext:prettyTrait(tr?.soilMoistureContext),
    traitDataset:tr?.dataset||null,
    geminiFilled:filled, usedGemini:filled.length>0
  };
}
function botanicalCoverage(care){
  const fields=[care.growthHabit,care.traitGrowthFormDetailed,care.traitWoodiness,care.traitLifeHistory,care.traitLeafPhenology,care.bloomMonths?.length?"yes":null,care.traitFlowerColour,care.height,care.traitSoilPH,care.traitTolerances,care.traitHabitat,care.traitVegetation,care.traitClimate,care.traitEllenberg,care.traitSubstrate,care.traitNutrientContext,care.traitSoilMoistureContext];
  const available=fields.filter(Boolean).length;
  return Math.round((available/fields.length)*100);
}
function isDistributionLikeText(text=""){
  const v=String(text||"").trim();
  if(!v) return false;
  const lower=v.toLowerCase();
  if(/^(native|introduced|range|distribution|occurs|found)\b/.test(lower)) return true;
  if(/\b(canada|u\.?s\.?a?\.?|united states|mexico|europe|asia|africa|australia|new zealand|britain|ireland|uk|north america|south america|mediterranean)\b/i.test(v)) return true;
  if((/[;,]|\bto\b|\bthrough\b|\bfrom\b/.test(lower)) && /\b(n\.?|s\.?|e\.?|w\.?|north|south|east|west)\b/i.test(v)) return true;
  return false;
}
function chooseProfileDescription({pn=null,t=null,g=null,p=null}={}){
  const candidates=[pn?.description,t?.growthDescription,t?.observations,...(Array.isArray(g?.descriptions)?g.descriptions.map(d=>d?.description):[]),p?.notes].filter(Boolean);
  const clean=candidates.map(v=>String(v).trim()).filter(Boolean);
  return clean.find(v=>!isDistributionLikeText(v)) || usable(p?.notes) || null;
}
function normaliseRangeLabel(text=""){
  return String(text||"")
    .replace(/\s+/g,' ')
    .replace(/\bE\. U\.S\.A\.\b/g,'eastern U.S.A.')
    .replace(/\bNC\.\b/g,'North Carolina')
    .replace(/\bE\. Canada\b/g,'eastern Canada')
    .trim();
}
function distributionSourceLabel(g){
  if(Array.isArray(g?.descriptions) && g.descriptions.length) return 'GBIF description';
  if(Array.isArray(g?.profiles) && g.profiles.length) return 'GBIF profile';
  return 'Botanical record';
}
function distributionTextFor(g=null){
  const descriptions=(Array.isArray(g?.descriptions)?g.descriptions:[])
    .map(x=>String(x?.description||'').trim())
    .filter(Boolean);
  const ranked=descriptions.sort((a,b)=>(isDistributionLikeText(b)?1:0)-(isDistributionLikeText(a)?1:0) || a.length-b.length);
  const picked=ranked.find(isDistributionLikeText) || null;
  return picked?normaliseRangeLabel(picked):null;
}
function detectDistributionRegions(text=""){
  const lower=String(text||'').toLowerCase();
  const regions=[];
  const add=r=>{ if(!regions.includes(r)) regions.push(r); };
  if(/canada|u\.?s\.?a?\.?|united states|mexico|north america|north carolina|eastern u\.?s\.?/.test(lower)) add('north-america');
  if(/south america|argentina|brazil|chile|peru|colombia|ecuador|uruguay|bolivia/.test(lower)) add('south-america');
  if(/europe|britain|ireland|uk|france|germany|spain|italy|mediterranean|scandinavia|balkans|portugal|netherlands/.test(lower)) add('europe');
  if(/africa|morocco|algeria|tunisia|south africa|kenya|ethiopia|madagascar/.test(lower)) add('africa');
  if(/asia|china|japan|korea|india|himalaya|indonesia|thailand|vietnam|malaysia|philippines/.test(lower)) add('asia');
  if(/australia|new zealand|oceania|tasmania/.test(lower)) add('oceania');
  return regions;
}
function buildDistributionRecord({g=null,p=null}={}){
  const text=distributionTextFor(g);
  const key=Number(g?.key)||null;
  if(!text && !key) return null;
  const regions=text?detectDistributionRegions(text):[];
  const short=text ? (text.length>92 ? `${text.slice(0,89)}…` : text) : 'Recorded GBIF occurrences for this species.';
  let label=text?'Distribution':'Recorded occurrences';
  if(text && /\bnative\b/i.test(text)) label='Native range';
  else if(text && /\bintroduced\b/i.test(text)) label='Introduced range';
  else if(text && /canada|u\.?s\.?a?\.?|united states|north america/i.test(text)) label='Native range';
  return {
    label,
    text:text||'',
    short,
    regions,
    key,
    source:key?'GBIF occurrence records':distributionSourceLabel(g),
    fallbackTitle:p?.common ? `${p.common} distribution` : 'Species distribution'
  };
}
function distributionBaseSvg(regions=[]){
  return `<svg viewBox="0 0 420 210" class="distribution-map-svg" role="img" aria-label="Distribution map preview"><image href="world-map.svg?v=1.2.17" x="0" y="0" width="420" height="210" preserveAspectRatio="none"/><g class="distribution-occurrences"></g></svg>`;
}

function renderDistributionCard(record){
  if(!record) return '';
  const regionText=record.regions.length
    ? record.regions.map(r=>({"north-america":"North America","south-america":"South America","europe":"Europe","africa":"Africa","asia":"Asia","oceania":"Australia / Oceania"}[r]||r)).join(' · ')
    : 'Occurrence map';
  const textArg=jsArg(record.text||record.short||'');
  const sourceArg=jsArg(record.source||'Botanical record');
  const keyAttr=record.key?` data-gbif-key="${record.key}"`:'';
  const gbifKey=record.key||0;
  return `<div class="distribution-card profile-card"><div class="profile-card-head"><div><div class="eyebrow">Biogeography</div><h2>${esc(record.label)}</h2></div><span>${esc(regionText)}</span></div><div class="distribution-map-wrap"><div class="distribution-live-map"${keyAttr}>${distributionBaseSvg(record.regions)}${record.key?`<div class="distribution-loading">Loading recorded locations…</div>`:''}</div></div><div class="distribution-caption"><div><b>${esc(record.short)}</b><small>${esc(record.source)}</small></div><button class="mini-action" type="button" onclick="showDistributionDetail(decodeURIComponent('${textArg}'), decodeURIComponent('${sourceArg}'), ${gbifKey})">Expand</button></div></div>`;
}
function lonLatToMap(lon,lat){
  const x=((Number(lon)+180)/360)*420;
  const y=((90-Number(lat))/180)*210;
  return {x:Math.max(0,Math.min(420,x)),y:Math.max(0,Math.min(210,y))};
}
let worldMapMaskPromise = null;
function landLikePixel(r,g,b,a){
  if(a < 10) return false;
  const brightness=(r+g+b)/3;
  return brightness < 221 && g < 232;
}
function getWorldMapMask(){
  if(worldMapMaskPromise) return worldMapMaskPromise;
  worldMapMaskPromise = new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{
      try{
        const canvas=document.createElement('canvas');
        canvas.width=420; canvas.height=210;
        const ctx=canvas.getContext('2d', {willReadFrequently:true});
        ctx.drawImage(img,0,0,420,210);
        const imageData=ctx.getImageData(0,0,420,210);
        resolve(imageData);
      }catch(err){ reject(err); }
    };
    img.onerror=()=>reject(new Error('Map mask failed to load'));
    img.src='world-map.svg?v=1.2.17';
  });
  return worldMapMaskPromise;
}
function snapPointToVisibleLand(mask,x,y,maxRadius=6){
  const w=mask.width, h=mask.height, data=mask.data;
  const scoreAt=(px,py)=>{
    if(px<0||py<0||px>=w||py>=h) return -1;
    const idx=(py*w+px)*4;
    return landLikePixel(data[idx],data[idx+1],data[idx+2],data[idx+3]) ? 2 : 0;
  };
  const cx=Math.round(x), cy=Math.round(y);
  if(scoreAt(cx,cy) > 0) return {x:cx, y:cy};
  let best=null;
  for(let radius=1; radius<=maxRadius; radius++){
    for(let py=cy-radius; py<=cy+radius; py++){
      for(let px=cx-radius; px<=cx+radius; px++){
        if(Math.max(Math.abs(px-cx), Math.abs(py-cy)) !== radius) continue;
        const base=scoreAt(px,py);
        if(base <= 0) continue;
        const dist=Math.hypot(px-cx, py-cy);
        const coastalBonus=(scoreAt(px+1,py)+scoreAt(px-1,py)+scoreAt(px,py+1)+scoreAt(px,py-1));
        const score=(12-dist)+coastalBonus;
        if(!best || score > best.score) best={x:px, y:py, score};
      }
    }
    if(best) break;
  }
  return best ? {x:best.x, y:best.y} : null;
}
function acceptableOccurrenceRecord(r){
  const lon=Number(r?.decimalLongitude), lat=Number(r?.decimalLatitude);
  if(!Number.isFinite(lon)||!Number.isFinite(lat)) return false;
  const uncertainty=Number(r?.coordinateUncertaintyInMeters);
  if(Number.isFinite(uncertainty) && uncertainty > 100000) return false;
  const issueText=Array.isArray(r?.issues) ? r.issues.join(',') : String(r?.issues||'');
  if(/COUNTRY_COORDINATE_MISMATCH|ZERO_COORDINATE|COORDINATE_INVALID|COORDINATE_OUT_OF_RANGE/i.test(issueText)) return false;
  const basis=String(r?.basisOfRecord||'');
  if(/FOSSIL_SPECIMEN|LIVING_SPECIMEN/i.test(basis)) return false;
  return true;
}
async function occurrenceDots(records=[]){
  const mask=await getWorldMapMask();
  const seen=new Set();
  const dots=[];
  let plotted=0;
  let filteredAtSea=0;
  for(const r of records){
    if(!acceptableOccurrenceRecord(r)) continue;
    const {x,y}=lonLatToMap(r.decimalLongitude,r.decimalLatitude);
    const snapped=snapPointToVisibleLand(mask,x,y,6);
    if(!snapped){ filteredAtSea++; continue; }
    const key=`${Math.round(snapped.x/5)}:${Math.round(snapped.y/5)}`;
    if(seen.has(key)) continue;
    seen.add(key);
    dots.push(`<circle class="occurrence-dot" cx="${snapped.x.toFixed(1)}" cy="${snapped.y.toFixed(1)}" r="3.1"/>`);
    plotted++;
    if(dots.length>=120) break;
  }
  return { svg:dots.join(''), plotted, filteredAtSea };
}
async function hydrateDistributionMaps(){
  const maps=[...document.querySelectorAll('.distribution-live-map[data-gbif-key]')];
  await Promise.all(maps.map(async el=>{
    if(el.dataset.loaded==='1') return;
    el.dataset.loaded='1';
    const key=el.dataset.gbifKey;
    const loader=el.querySelector('.distribution-loading');
    try{
      const url=`https://api.gbif.org/v1/occurrence/search?taxon_key=${encodeURIComponent(key)}&has_coordinate=true&limit=200`;
      const res=await fetch(url);
      if(!res.ok) throw new Error(`GBIF ${res.status}`);
      const data=await res.json();
      const rows=Array.isArray(data?.results)?data.results:[];
      const rendered=await occurrenceDots(rows);
      const group=el.querySelector('.distribution-occurrences');
      if(group) group.innerHTML=rendered.svg;
      if(loader) loader.outerHTML=`<div class="distribution-map-note"><span>${rendered.plotted?`${rendered.plotted} mapped from ${Math.min(rows.length,200)} GBIF records`:'No mappable GBIF land records found'}</span><b>GBIF</b></div><div class="distribution-map-caveat">Recorded occurrences may include cultivated or approximate observations. Offshore points are hidden.</div>`;
    }catch(err){
      console.warn('GBIF occurrence map failed',err);
      if(loader) loader.textContent='Occurrence map unavailable offline';
    }
  }));
}
function showDistributionDetail(text='',source='Botanical record',gbifKey=0){
  const keyAttr=Number(gbifKey)?` data-gbif-key="${Number(gbifKey)}"`:'';
  modal(`<div class="eyebrow">Distribution map</div><h2>Recorded occurrences</h2><div class="distribution-modal-live distribution-live-map"${keyAttr}>${distributionBaseSvg([])}${Number(gbifKey)?`<div class="distribution-loading">Loading recorded locations…</div>`:''}</div><p class="sub distribution-modal-copy">${esc(text||'FloraLens is using georeferenced GBIF occurrence records to show where this species has been recorded.')}</p><div class="small" style="margin-top:8px">Source: ${esc(source)}</div><p class="small" style="margin-top:10px">Mapped points are filtered for obviously invalid coordinates and large uncertainty, then snapped only onto visible land on the FloraLens map.</p><button class="btn primary" style="width:100%;margin-top:14px" onclick="closeModal()">Close</button>`);
  if(Number(gbifKey)) setTimeout(()=>hydrateDistributionMaps(),0);
}


const defaultState = {
  plants: [
    {id:"rose",speciesKey:"rosa-gertrude-jekyll",common:"Gertrude Jekyll",scientific:"Rosa 'Gertrude Jekyll'",family:"Rosaceae",area:"Back border",status:"Flowering",art:"rose",added:"2026-06-14",notes:"Deep pink, strongly fragrant blooms.",sun:"Full sun",water:"Moderate",soil:"Moist, well-drained",height:"1.2–1.5 m",bloom:[5,6,7,8,9]},
    {id:"lavender",speciesKey:"lavandula-angustifolia",common:"English Lavender",scientific:"Lavandula angustifolia",family:"Lamiaceae",area:"Patio",status:"Flowering",art:"lavender",added:"2026-07-02",notes:"Aromatic evergreen perennial loved by pollinators.",sun:"Full sun",water:"Low",soil:"Free-draining",height:"0.4–0.7 m",bloom:[6,7,8,9]},
    {id:"hydrangea",speciesKey:"hydrangea-macrophylla",common:"Hydrangea",scientific:"Hydrangea macrophylla",family:"Hydrangeaceae",area:"Side border",status:"Flowering",art:"hydrangea",added:"2026-05-28",notes:"Large rounded flower heads with lush foliage.",sun:"Part shade",water:"Regular",soil:"Moist, fertile",height:"1–2 m",bloom:[7,8,9]}
  ],
  speciesCache: {
    "lavandula-angustifolia": {scientific:"Lavandula angustifolia", common:"English Lavender", family:"Lamiaceae", source:"starter", fetchedAt:"2026-09-06"}
  },
  areas:["Front Garden","Back Garden","Patio","Indoors","Greenhouse","Unplaced"],
  journal: [],
  careTasks: [],
  gardenView: "gallery",
  discoveries: [],
  lastQuota: null
};

let state = loadState();
let currentRoute = "home";
let captures = []; // [{id,file,dataUrl,organ}]
let pendingResults = null;
let chosenArea = "Unplaced";
let captureIntent = "identify"; // identify | discover
let doctorPlantId = null;
let doctorLastResult = null;

function loadState(){
  try {
    const old = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = {...structuredClone(defaultState), ...old};
    merged.speciesCache = {...defaultState.speciesCache, ...(old.speciesCache||{})};
    merged.areas = old.areas?.length ? old.areas : defaultState.areas;
    merged.discoveries = Array.isArray(old.discoveries) ? old.discoveries : [];
    merged.journal = Array.isArray(old.journal) ? old.journal : [];
    merged.careTasks = Array.isArray(old.careTasks) ? old.careTasks : [];
    merged.gardenView = old.gardenView==="map" ? "map" : "gallery";
    return merged;
  } catch { return structuredClone(defaultState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
// Plain-English message when a request fails for lack of signal
function friendlyNetError(err,what="This"){
  const msg=String(err?.message||err||"");
  if(!navigator.onLine || /failed to fetch|load failed|networkerror|network connection/i.test(msg))
    return `You're offline. ${what} needs a signal. Your photos are still here, so try again once you're connected.`;
  return msg;
}

// Safe for a JS string inside an onclick attribute (handles apostrophes too)
function jsArg(s=""){ return encodeURIComponent(String(s)).replace(/'/g,"%27"); }
function esc(s=""){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function slug(s=""){ return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-"); }
function toast(msg){ document.body.insertAdjacentHTML("beforeend",`<div class="toast" id="toast">${esc(msg)}</div>`); setTimeout(()=>document.getElementById("toast")?.remove(),2200); }

function photoDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(PHOTO_DB,1);
    req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(PHOTO_STORE)) req.result.createObjectStore(PHOTO_STORE); };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function savePhoto(key, blob){
  const db=await photoDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,"readwrite");
    tx.objectStore(PHOTO_STORE).put(blob,key);
    tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
  });
}
async function getPhotoUrl(key){
  if(!key) return null;
  try{
    const db=await photoDB();
    const blob=await new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,"readonly");
      const req=tx.objectStore(PHOTO_STORE).get(key);
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
    return blob ? URL.createObjectURL(blob) : null;
  }catch{return null}
}

async function deletePhoto(key){
  if(!key) return;
  try{
    const db=await photoDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,"readwrite");
      tx.objectStore(PHOTO_STORE).delete(key);
      tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
    });
  }catch(e){ console.warn("Photo delete failed",e); }
}

function setRoute(route, data={}){
  currentRoute=route;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.route===route));
  if(route==="home") renderHome();
  if(route==="garden") renderGarden();
  if(route==="lens") renderLens();
  if(route==="journal") renderJournal();
  if(route==="care") renderCareCalendar();
  if(route==="discover") renderDiscover();
  if(route==="profile" && data.id) renderProfile(data.id);
  appScrollTo(0);   // new screen opens at the top, like a native app
}

function pin(p,{canDelete=false}={}){
  return `<article class="pin" onclick="if(!event.target.closest('.pin-delete')) setRoute('profile',{id:'${p.id}'})">
    <div class="plant-art ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}" data-photo-url="${esc(p.photoUrl||"")}"></div>
    ${canDelete?`<button class="pin-delete" aria-label="Delete ${esc(p.common)}" title="Delete" onclick="event.stopPropagation();confirmDeletePlant('${p.id}')">×</button>`:""}
    <div class="pin-body"><b>${esc(p.common)}</b><small><i>${esc(p.scientific)}</i></small><br><span class="chip">✿ ${esc(p.status||p.area||"Saved")}</span></div>
  </article>`;
}
async function hydratePhotos(scope=document){
  for(const n of scope.querySelectorAll("[data-photo-url]")){
    if(!n.dataset.photoKey&&n.dataset.photoUrl){ n.style.backgroundImage=`url("${n.dataset.photoUrl}")`; n.style.backgroundSize="cover"; n.style.backgroundPosition="center"; }
  }
  const nodes=[...scope.querySelectorAll("[data-photo-key]")].filter(n=>n.dataset.photoKey);
  for(const n of nodes){
    const url=await getPhotoUrl(n.dataset.photoKey);
    if(url){ n.style.backgroundImage=`url("${url}")`; n.style.backgroundSize="cover"; n.style.backgroundPosition="center"; }
  }
}


function currentMonthNumber(){ return new Date().getMonth()+1; }
function currentMonthName(){ return new Date().toLocaleDateString("en-GB",{month:"long"}); }
function currentSeasonName(){
  const m=currentMonthNumber();
  if([3,4,5].includes(m)) return "Spring";
  if([6,7,8].includes(m)) return "Summer";
  if([9,10,11].includes(m)) return "Autumn";
  return "Winter";
}
function plantBloomMonths(p){
  const c=careForPlant(p);
  const arr=Array.isArray(c?.bloomMonths)?c.bloomMonths:[];
  return arr.map(Number).filter(n=>n>=1&&n<=12);
}
function plantsFloweringNow(){
  const m=currentMonthNumber();
  return state.plants.filter(p=>plantBloomMonths(p).includes(m));
}
function plantsComingSoon(){
  const m=currentMonthNumber();
  const next=m===12?1:m+1;
  return state.plants.filter(p=>{
    const months=plantBloomMonths(p);
    return !months.includes(m) && months.includes(next);
  });
}
function journalFloweringEntries(){
  return state.journal.filter(j=>String(j.type).toLowerCase()==="flowering");
}
function seasonalSnapshot(){
  const flowering=plantsFloweringNow();
  const soon=plantsComingSoon();
  const careDue=activeCareTasks().filter(t=>t.due<=localISODate()).length;
  const month=currentMonthNumber();
  const momentsThisMonth=state.journal.filter(j=>{
    const d=new Date(`${j.date||""}T12:00:00`);
    return !isNaN(d) && d.getMonth()+1===month && d.getFullYear()===new Date().getFullYear();
  }).length;
  return {flowering,soon,careDue,momentsThisMonth};
}
function seasonalHomeCard(){
  const s=seasonalSnapshot();
  const parts=[];
  if(s.flowering.length) parts.push(`${s.flowering.length} ${s.flowering.length===1?"plant":"plants"} flowering`);
  if(s.careDue) parts.push(`${s.careDue} care ${s.careDue===1?"job":"jobs"} due`);
  if(s.momentsThisMonth) parts.push(`${s.momentsThisMonth} new ${s.momentsThisMonth===1?"moment":"moments"}`);
  if(!parts.length) parts.push("A quieter month in the garden");
  return `<button class="season-home-card" onclick="openSeasonalView()">
    <span class="season-mark">${currentSeasonName()==="Autumn"?"❦":currentSeasonName()==="Winter"?"✦":currentSeasonName()==="Spring"?"❀":"✿"}</span>
    <span><small>${currentSeasonName()} in the garden</small><strong>${currentMonthName()} in your garden</strong><em>${parts.join(" · ")}</em></span><b>→</b>
  </button>`;
}
function seasonalPlantCard(p,label){
  return `<article class="season-plant-card" onclick="setRoute('profile',{id:'${p.id}'})">
    <div class="season-plant-photo ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}"></div>
    <div><span>${esc(label)}</span><h3>${esc(p.common)}</h3><small><i>${esc(p.scientific)}</i></small></div>
  </article>`;
}
function openSeasonalView(){
  const flowering=plantsFloweringNow();
  const soon=plantsComingSoon();
  const floweringJournal=journalFloweringEntries().sort((x,y)=>String(y.date||"").localeCompare(String(x.date||"")));
  const care=smartCareSuggestions().slice(0,6);
  modal(`<div class="season-sheet">
    <div class="eyebrow">${currentSeasonName()} garden</div>
    <h2>${currentMonthName()} in your garden</h2>
    <p class="sub">What FloraLens genuinely knows from your plant records and your own journal — without guessing where data is missing.</p>
    ${flowering.length?`<div class="section-title"><h3>Flowering now</h3><span>${flowering.length}</span></div><div class="season-scroll">${flowering.map(p=>seasonalPlantCard(p,"Flowering now")).join("")}</div>`:""}
    ${soon.length?`<div class="section-title"><h3>Coming soon</h3><span>${soon.length}</span></div><div class="season-scroll">${soon.map(p=>seasonalPlantCard(p,"Expected next month")).join("")}</div>`:""}
    <div class="section-title"><h3>Seasonal care</h3></div>
    ${care.length?`<div class="season-care-list">${care.map(s=>`<button onclick="closeModal();addSuggestedCare('${encodeURIComponent(s.key)}')"><span>${careTaskIcon(s.type)}</span><div><b>${esc(s.title)}</b><small>${esc(s.detail)}</small></div><strong>＋</strong></button>`).join("")}</div>`:`<div class="empty-card"><p class="sub">No new seasonal care suggestions right now.</p></div>`}
    <div class="section-title"><h3>Bloom mosaic</h3><button class="link-btn" onclick="closeModal();openBloomMosaic()">Open</button></div>
    <p class="sub">${floweringJournal.length?`${floweringJournal.length} flowering ${floweringJournal.length===1?"moment":"moments"} recorded so far.`:"Add a Journal moment marked Flowering to start your bloom mosaic."}</p>
  </div>`);
  hydratePhotos();
}
function openBloomMosaic(){
  const entries=journalFloweringEntries().filter(j=>j.photoKey).sort((x,y)=>String(y.date||"").localeCompare(String(x.date||"")));
  const plantCount=new Set(entries.map(j=>j.plantId)).size;
  modal(`<div class="eyebrow">Garden year</div><h2>Bloom Mosaic</h2><p class="sub">A photographic record built only from flowering moments you've actually captured.</p>
    ${entries.length?`<div class="bloom-summary"><span><b>${entries.length}</b><small>flowering moments</small></span><span><b>${plantCount}</b><small>plants</small></span><span><b>${new Date().getFullYear()}</b><small>garden year</small></span></div>
    <div class="bloom-mosaic">${entries.map(j=>{const p=state.plants.find(x=>x.id===j.plantId);return `<button onclick="closeModal();setRoute('profile',{id:'${j.plantId}'})"><span class="bloom-photo" data-photo-key="${esc(j.photoKey)}"></span><em>${p?esc(p.common):"Garden bloom"}</em><small>${formatJournalDate(j.date)}</small></button>`}).join("")}</div>`
    :`<div class="empty-card bloom-empty"><div>❀</div><h3>Your blooms will gather here</h3><p class="sub">When something flowers, add a Journal moment with a photo and choose “Flowering”.</p></div>`}
  `);
  hydratePhotos();
}
function gardenYearStats(){
  const year=new Date().getFullYear();
  const inYear=(date)=>{
    if(!date) return false;
    const d=new Date(date.length===10?`${date}T12:00:00`:date);
    return !isNaN(d) && d.getFullYear()===year;
  };
  const added=state.plants.filter(p=>inYear(p.added)).length;
  const discovered=state.discoveries.filter(d=>inYear(d.spotted)).length;
  const journal=state.journal.filter(j=>inYear(j.date||j.createdAt));
  const flowering=journal.filter(j=>j.type==="Flowering").length;
  const areas=state.areas.filter(a=>a!=="Unplaced").length;
  const counts={};
  journal.forEach(j=>counts[j.plantId]=(counts[j.plantId]||0)+1);
  const topId=Object.keys(counts).sort((x,y)=>counts[y]-counts[x])[0];
  const topPlant=state.plants.find(p=>p.id===topId);
  return {year,added,discovered,journal:journal.length,flowering,areas,topPlant,topCount:topId?counts[topId]:0};
}
function openGardenYear(){
  const y=gardenYearStats();
  modal(`<div class="eyebrow">${y.year} garden year</div><h2>Your garden, remembered</h2><p class="sub">A live preview of the story FloraLens is already collecting for your end-of-year recap.</p>
    <div class="year-grid">
      <div><b>${y.added}</b><small>plants added</small></div>
      <div><b>${y.discovered}</b><small>discoveries</small></div>
      <div><b>${y.journal}</b><small>journal moments</small></div>
      <div><b>${y.flowering}</b><small>flowering moments</small></div>
      <div><b>${y.areas}</b><small>garden spaces</small></div>
      <div><b>${y.topCount||0}</b><small>${y.topPlant?`moments for ${esc(y.topPlant.common)}`:"most-photographed count"}</small></div>
    </div>
    <button class="btn secondary" style="width:100%;margin-top:14px" onclick="closeModal();openBloomMosaic()">View bloom mosaic</button>`);
}
/* ===================== Garden weather (Open-Meteo: free, no key) =====================
   Forecast for the garden's location, cached for an hour. All the garden advice
   (frost, wind, heat, rain, dry spells) is worked out here from the numbers; no AI calls. */
const WX_URL="https://api.open-meteo.com/v1/forecast";
const WX_GEO="https://geocoding-api.open-meteo.com/v1/search";
const WX_DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
let wxBusy=false;

function wxIcon(code,cls="wx-ico"){
  const c=Number(code);
  const sun='<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>';
  const cloud='<path d="M7 18.5h10.2a3.8 3.8 0 0 0 .5-7.6A5.5 5.5 0 0 0 7.2 9.6 4.5 4.5 0 0 0 7 18.5z"/>';
  const part='<path d="M8.5 4.5v1.3M4.2 6.3l.9.9M2.8 10.5h1.3"/><path d="M6.4 11.6A3.6 3.6 0 0 1 11.6 7"/><path d="M9 19.5h9a3.3 3.3 0 0 0 .4-6.6 4.8 4.8 0 0 0-9.2-1.2A3.9 3.9 0 0 0 9 19.5z"/>';
  const rain='<path d="M7 15.5h10.2a3.8 3.8 0 0 0 .5-7.6A5.5 5.5 0 0 0 7.2 6.6 4.5 4.5 0 0 0 7 15.5z"/><path d="M8.5 18.2l-1 2.3M12.5 18.2l-1 2.3M16.5 18.2l-1 2.3"/>';
  const snow='<path d="M7 15h10.2a3.8 3.8 0 0 0 .5-7.6A5.5 5.5 0 0 0 7.2 6.1 4.5 4.5 0 0 0 7 15z"/><path d="M8.5 18.5h.01M12 20h.01M15.5 18.5h.01" stroke-width="2.6"/>';
  const storm='<path d="M7 15h10.2a3.8 3.8 0 0 0 .5-7.6A5.5 5.5 0 0 0 7.2 6.1 4.5 4.5 0 0 0 7 15z"/><path d="M12.5 15.5l-2 3.3h3l-2 3.2"/>';
  const fog='<path d="M7 13h10.2a3.8 3.8 0 0 0 .5-7.6A5.5 5.5 0 0 0 7.2 4.1 4.5 4.5 0 0 0 7 13z"/><path d="M4 16.5h16M6 19.5h12"/>';
  const body=c===0?sun:c<=2?part:c===3?cloud:c<=48?fog:(c>=71&&c<=77)||c===85||c===86?snow:c>=95?storm:c>=51?rain:cloud;
  const tone=c===0?"sun":c<=2?"part":(c>=51&&c<=67)||(c>=80&&c<=82)?"rain":(c>=71&&c<=77)||c===85||c===86?"snow":c>=95?"storm":"cloud";
  return `<svg class="${cls} wx-${tone}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}
function wxLabel(code){
  const c=Number(code);
  if(c===0) return "Clear"; if(c<=2) return "Partly cloudy"; if(c===3) return "Cloudy"; if(c<=48) return "Fog";
  if(c<=57) return "Drizzle"; if(c<=67) return "Rain"; if(c<=77) return "Snow"; if(c<=82) return "Showers"; if(c<=86) return "Snow showers"; return "Thunderstorms";
}

async function refreshWeather(force=false){
  const loc=state.weatherLocation;
  if(!loc||!navigator.onLine||wxBusy) return false;
  const w=state.weather;
  if(!force&&w?.fetchedAt&&w.lat===loc.lat&&w.lon===loc.lon&&Date.now()-new Date(w.fetchedAt).getTime()<60*60e3) return false;
  wxBusy=true;
  try{
    const q=new URLSearchParams({latitude:loc.lat,longitude:loc.lon,timezone:"Europe/London",past_days:"2",forecast_days:"7",
      current:"temperature_2m,weather_code",
      daily:"weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max"});
    const res=await fetch(`${WX_URL}?${q}`);
    if(!res.ok) throw new Error(`Weather ${res.status}`);
    const j=await res.json(); const d=j.daily||{};
    state.weather={fetchedAt:new Date().toISOString(),lat:loc.lat,lon:loc.lon,
      current:{temp:j.current?.temperature_2m,code:j.current?.weather_code},
      days:(d.time||[]).map((t,i)=>({date:t,code:d.weather_code?.[i],max:d.temperature_2m_max?.[i],min:d.temperature_2m_min?.[i],
        rain:d.precipitation_sum?.[i]??0,chance:d.precipitation_probability_max?.[i]??null,gust:d.wind_gusts_10m_max?.[i]??0}))};
    saveState();
    return true;
  }catch(e){ console.warn("Weather",e); return false; }
  finally{ wxBusy=false; }
}
function wxToday(){ return localISODate(); }
function wxSplit(){
  const days=state.weather?.days||[]; const t=wxToday();
  const i=days.findIndex(d=>d.date===t);
  return i<0?{past:[],today:null,next:[]}:{past:days.slice(0,i),today:days[i],next:days.slice(i+1)};
}
function wxDayName(date,short=false){
  const t=wxToday(); const tm=localISODate(new Date(Date.now()+86400000));
  if(date===t) return short?"Today":"today"; if(date===tm) return short?"Tmrw":"tomorrow";
  const d=new Date(`${date}T12:00:00`); return short?WX_DAYS[d.getDay()]:d.toLocaleDateString("en-GB",{weekday:"long"});
}
function isOutdoorPlant(p){ return areaMood(p.area||"").cls!=="indoor"; }
function isTenderPlant(p){
  const c=careForPlant(p);
  const t=`${c?.hardiness||""} ${c?.growthHabit||""}`.toLowerCase();
  return /tender|not hardy|frost[- ]?(sensitive|tender)|protect from (frost|cold)|houseplant|\bh1[abc]?\b|\bh2\b|\bh3\b|minimum temperature [0-9]{2}/.test(t);
}
function weatherAlerts(){
  const {past,today,next}=wxSplit(); if(!today) return [];
  const soon=[today,...next.slice(0,2)];
  const out=[];
  const outdoor=state.plants.filter(isOutdoorPlant);
  const frost=soon.find(d=>d.min!=null&&d.min<=2);
  if(frost){
    const tender=outdoor.filter(isTenderPlant);
    const when=frost.date===today.date?"tonight":`${wxDayName(frost.date)} night`;
    out.push({type:"frost",level:frost.min<=0?"high":"medium",icon:"❄",
      title:frost.min<=0?`Frost ${when} (${Math.round(frost.min)}°)`:`Near-frost ${when} (${Math.round(frost.min)}°)`,
      detail:tender.length?`Protect ${tender.slice(0,4).map(p=>p.common).join(", ")}${tender.length>4?` and ${tender.length-4} more`:""}: fleece, or move pots somewhere sheltered.`:"Move tender pots under cover and fleece anything newly planted.",
      plants:tender.map(p=>p.id),date:frost.date});
  }
  const windy=soon.find(d=>d.gust>=55);
  if(windy) out.push({type:"wind",level:windy.gust>=75?"high":"medium",icon:"⌁",title:`Strong winds ${wxDayName(windy.date)} (gusts ${Math.round(windy.gust)} km/h)`,
    detail:"Check stakes and ties on tall plants, and move light pots out of exposed spots."});
  const hot=soon.find(d=>d.max>=27);
  if(hot) out.push({type:"heat",level:"medium",icon:"☀",title:`Hot ${wxDayName(hot.date)} (${Math.round(hot.max)}°)`,
    detail:"Water pots and new plants in the evening, and give shade to anything that wilts."});
  const recentRain=[...past.slice(-2),today].reduce((a,d)=>a+(d?.rain||0),0);
  const comingRain=next.slice(0,2).reduce((a,d)=>a+(d?.rain||0),0);
  if(recentRain>=5) out.push({type:"rain",level:"good",icon:"💧",title:`${Math.round(recentRain)} mm of rain recently`,
    detail:"Plants in the ground won't need watering. Check pots under cover, which the rain may have missed."});
  else if(comingRain>=5) out.push({type:"rain",level:"good",icon:"💧",title:`Rain on the way (${Math.round(comingRain)} mm by ${wxDayName(next[Math.min(1,next.length-1)]?.date||today.date)})`,
    detail:"Hold off watering plants in the ground; the rain should do it for you."});
  else if(recentRain+comingRain<1&&today.max>=18) out.push({type:"dry",level:"medium",icon:"◌",title:"Dry spell",
    detail:"No real rain for a few days. Water pots and anything planted this year, ideally in the evening."});
  return out;
}
function wxRainedRecently(){ const {past,today}=wxSplit(); return [...past.slice(-2),today].reduce((a,d)=>a+(d?.rain||0),0)>=5; }
function weatherContextLine(){
  const {past,today,next}=wxSplit(); if(!today) return null;
  const recent=[...past,today]; const ahead=next.slice(0,3);
  const r=a=>Math.round(a.reduce((s,d)=>s+(d.rain||0),0));
  const lo=a=>Math.round(Math.min(...a.map(d=>d.min))); const hi=a=>Math.round(Math.max(...a.map(d=>d.max)));
  return `Local weather: last ${recent.length} days ${lo(recent)} to ${hi(recent)}°C with ${r(recent)} mm rain; next ${ahead.length} days ${lo(ahead)} to ${hi(ahead)}°C with ${r(ahead)} mm rain${ahead.some(d=>d.min<=2)?", frost possible":""}.`;
}

/* ---------- Home card ---------- */
function weatherHomeCard(){
  if(!state.weatherLocation){
    return `<button class="wx-card wx-setup" onclick="openWeatherSetup()"><span class="wx-setup-ico">${wxIcon(2)}</span><span><small>Garden weather</small><strong>Add your local weather</strong><em>Frost, wind and rain warnings for your plants.</em></span><b>→</b></button>`;
  }
  const {today}=wxSplit(); const cur=state.weather?.current;
  if(!today||cur?.temp==null){
    return `<button class="wx-card" onclick="openWeatherSheet()"><span class="wx-now">${wxIcon(3,"wx-big")}<b>–°</b></span><span class="wx-meta"><small>${esc(state.weatherLocation.name)}</small><strong>Fetching the forecast…</strong></span></button>`;
  }
  const alerts=weatherAlerts();
  const top=alerts[0];
  return `<button class="wx-card ${top?`wx-alert-${top.level}`:""}" onclick="openWeatherSheet()">
    <span class="wx-row"><span class="wx-now">${wxIcon(cur.code,"wx-big")}<b>${Math.round(cur.temp)}°</b></span>
      <span class="wx-meta"><small>${esc(state.weatherLocation.name)}</small><strong>${esc(wxLabel(today.code))}</strong><em>High ${Math.round(today.max)}° · Low ${Math.round(today.min)}°${today.chance!=null?` · Rain ${today.chance}%`:""}</em></span><b class="wx-go">→</b></span>
    ${top?`<span class="wx-alert"><i>${top.icon}</i><span><b>${esc(top.title)}</b><small>${esc(top.detail)}</small></span></span>`:""}
    ${alerts.length>1?`<span class="wx-more">+${alerts.length-1} more weather note${alerts.length>2?"s":""}</span>`:""}
  </button>`;
}
function openWeatherSheet(){
  const days=[wxSplit().today,...wxSplit().next].filter(Boolean).slice(0,7);
  const alerts=weatherAlerts();
  const age=state.weather?.fetchedAt?Math.round((Date.now()-new Date(state.weather.fetchedAt).getTime())/60000):null;
  modal(`<div class="eyebrow">Garden weather</div><h2>${esc(state.weatherLocation?.name||"Your garden")}</h2>
    ${days.length?`<div class="wx-week">${days.map(d=>`<div class="${d.min<=2?"frosty":""}"><small>${wxDayName(d.date,true)}</small>${wxIcon(d.code)}<b>${Math.round(d.max)}°</b><em>${Math.round(d.min)}°</em>${d.rain>=0.5?`<span>${d.rain<10?d.rain.toFixed(1):Math.round(d.rain)} mm</span>`:`<span class="dry">—</span>`}</div>`).join("")}</div>`:`<p class="sub">No forecast yet.</p>`}
    ${alerts.length?`<div class="wx-alert-list">${alerts.map(a=>`<div class="wx-alert wx-alert-${a.level}"><i>${a.icon}</i><span><b>${esc(a.title)}</b><small>${esc(a.detail)}</small></span></div>`).join("")}</div>`:`<div class="wx-calm">Nothing to worry about this week. A good time to get out in the garden.</div>`}
    ${alerts.some(a=>a.type==="frost"&&a.plants.length)?`<button class="btn primary" style="width:100%;margin-top:12px" onclick="addFrostJobs()">❄ Add frost protection to Care</button>`:""}
    <div class="wx-foot"><button class="link-btn" onclick="openWeatherSetup()">Change location</button><span>Open-Meteo${age!=null?` · updated ${age<2?"just now":age<60?`${age} min ago`:`${Math.round(age/60)} h ago`}`:""}</span></div>`);
}
function addFrostJobs(){
  const a=weatherAlerts().find(x=>x.type==="frost"); if(!a) return;
  let n=0;
  for(const id of a.plants){
    const p=state.plants.find(x=>x.id===id); if(!p) continue;
    const key=`frost-${id}-${a.date}`;
    if(state.careTasks.some(t=>t.suggestionKey===key)) continue;
    state.careTasks.push({id:"care-"+Date.now()+"-"+n,plantId:id,title:`Protect ${p.common} from frost`,type:"Protect",due:a.date,
      notes:`${a.title}. Fleece it, or move it somewhere sheltered.`,completed:false,createdAt:new Date().toISOString(),suggestionKey:key});
    n++;
  }
  saveState(); closeModal();
  toast(n?`${n} frost job${n===1?"":"s"} added to Care`:"Frost jobs are already in Care");
  if(currentRoute==="home") renderHome(); else if(currentRoute==="care") renderCareCalendar();
}

/* ---------- Location ---------- */
function openWeatherSetup(){
  modal(`<div class="eyebrow">Garden weather</div><h2>Where's your garden?</h2>
    <p class="sub">FloraLens uses this only to fetch the local forecast.</p>
    <button class="destination-choice" onclick="useMyLocation()"><span>◎</span><div><b>Use my current location</b><small>Best when you're at home.</small></div></button>
    <label class="field-label" for="wxTown">Or search for a town or village</label>
    <form class="lookup-row" onsubmit="event.preventDefault();searchWeatherTown(document.getElementById('wxTown').value)"><input id="wxTown" autocomplete="off" placeholder="e.g. Harrogate"><button aria-label="Search">→</button></form>
    <div id="wxResults" class="wx-results"></div>
    ${state.weatherLocation?`<button class="link-btn discovery-delete-link" style="width:100%" onclick="clearWeatherLocation()">Turn off weather</button>`:""}`);
}
function useMyLocation(){
  if(!navigator.geolocation){ toast("Location isn't available on this device"); return; }
  toast("Finding your location…");
  navigator.geolocation.getCurrentPosition(async pos=>{
    await setWeatherLocation({name:"Home",lat:+pos.coords.latitude.toFixed(3),lon:+pos.coords.longitude.toFixed(3)});
  },err=>{ toast(err.code===1?"Location permission was declined. Search for your town instead.":"Couldn't get your location. Search for your town instead."); },{enableHighAccuracy:false,timeout:12000,maximumAge:3600e3});
}
async function searchWeatherTown(q){
  q=String(q||"").trim(); const box=document.getElementById("wxResults"); if(!q||!box) return;
  box.innerHTML=`<p class="small">Searching…</p>`;
  try{
    const res=await fetch(`${WX_GEO}?${new URLSearchParams({name:q,count:"6",language:"en",format:"json",countryCode:"GB"})}`);
    const j=await res.json(); const rows=j.results||[];
    box.innerHTML=rows.length?rows.map(r=>`<button class="destination-choice" onclick="setWeatherLocation({name:decodeURIComponent('${jsArg(r.name)}'),lat:${+r.latitude.toFixed(3)},lon:${+r.longitude.toFixed(3)}})"><span>⌂</span><div><b>${esc(r.name)}</b><small>${esc([r.admin2,r.admin1].filter(Boolean).join(", "))}</small></div></button>`).join("")
      :`<p class="small">No UK places called “${esc(q)}”. Try a nearby town.</p>`;
  }catch(e){ box.innerHTML=`<p class="small">${esc(friendlyNetError(e,"Searching"))}</p>`; }
}
async function setWeatherLocation(loc){
  state.weatherLocation=loc; state.weather=null; saveState();
  closeModal(); toast(`Weather set to ${loc.name}`);
  if(currentRoute==="home") renderHome();
  if(await refreshWeather(true)){ if(currentRoute==="home") renderHome(); }
}
function clearWeatherLocation(){
  state.weatherLocation=null; state.weather=null; saveState(); closeModal(); toast("Weather turned off");
  if(currentRoute==="home") renderHome();
}
async function weatherTick(){
  if(await refreshWeather()){ if(currentRoute==="home") renderHome(); else if(currentRoute==="care") renderCareCalendar(); }
}
window.addEventListener("load",()=>setTimeout(weatherTick,1200));
window.addEventListener("online",()=>setTimeout(weatherTick,1500));
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") setTimeout(weatherTick,1500); });

function homeGreeting(){
  const h=new Date().getHours();
  return h<12?"Good morning":h<18?"Good afternoon":"Good evening";
}
function homeHeroLeaves(){
  return `<div class="home-hero-leaves" aria-hidden="true"><svg viewBox="0 0 200 200">
    <path d="M150 20c-48 6-86 40-92 96 54-4 90-40 92-96z" fill="rgba(255,255,255,.10)"/>
    <path d="M150 20C120 52 96 82 58 116" stroke="rgba(255,255,255,.18)" stroke-width="2" fill="none"/>
    <path d="M196 70c-40 2-70 26-80 66 42 2 74-24 80-66z" fill="rgba(31,203,130,.35)"/>
    <path d="M110 150c-30-6-60 6-76 34 32 8 62-6 76-34z" fill="rgba(255,255,255,.07)"/>
    <circle cx="176" cy="150" r="7" fill="#F77BB4"/><circle cx="176" cy="150" r="2.6" fill="#FFE0EC"/>
    <circle cx="160" cy="168" r="5" fill="#FFC95C"/>
  </svg></div>`;
}
function renderHome(){
  const flowering=plantsFloweringNow().length;
  const recent=[...state.plants].slice(0,10);
  view.innerHTML=`
    <section class="home-hero">
      ${homeHeroLeaves()}
      <p class="home-greeting">${homeGreeting()} · ${new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</p>
      <h1>What's growing today?</h1>
      <button class="home-scan" onclick="startCamera()"><span class="home-scan-icon">⌾</span><span><b>Identify a plant</b><small>Snap a flower, leaf or bark</small></span><span class="go">→</span></button>
      <div class="home-stats"><div><b>${state.plants.length}</b><small>in your garden</small></div><div><b>${flowering}</b><small>flowering now</small></div><div><b>${state.discoveries.length}</b><small>discoveries</small></div></div>
    </section>
    <div class="quick-grid">
      <button class="quick-tile t-identify" onclick="startCamera()"><span>⌾</span><small>Identify</small></button>
      <button class="quick-tile t-doctor" onclick="openPlantDoctor()"><span>✚</span><small>Plant Doctor</small></button>
      <button class="quick-tile t-care" onclick="setRoute('care')"><span>💧</span><small>Care</small></button>
      <button class="quick-tile t-journal" onclick="openJournalComposer()"><span>✎</span><small>Add moment</small></button>
    </div>
    <div class="section-title"><h3>My plants</h3><button class="link-btn" onclick="setRoute('garden')">See all</button></div>
    <div class="plant-rail">
      ${recent.map(p=>`<button class="rail-card" onclick="setRoute('profile',{id:'${p.id}'})"><span class="plant-art ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}" data-photo-url="${esc(p.photoUrl||"")}"></span><span class="rail-copy"><b>${esc(p.common)}</b><small>${esc(p.area||"Unplaced")}</small></span></button>`).join("")}
      <button class="rail-card rail-add" onclick="startCamera()"><span>＋</span>Add a plant</button>
    </div>
    <div class="section-title"><h3>Today in the garden</h3></div>
    ${weatherHomeCard()}
    ${careHomeCard()}
    ${seasonalHomeCard()}`;
  hydratePhotos();
}

/* ===================== "What should I plant here?" (Garden, via Gemini) ===================== */
const PLAN_SETTING=["In the ground","In pots","Indoors"];
const PLAN_SUN=["Full sun","Part shade","Shade","Not sure"];
const PLAN_SOIL=["Clay","Loam","Sandy","Chalky","Not sure"];
const PLAN_MOIST=["Dry","Average","Damp"];
const PLAN_WISHES={
  "Colours":["Pink","Purple","Blue","White","Yellow","Red & orange"],
  "Height":["Low (under 50 cm)","Medium","Tall (over 1 m)","Climber"],
  "Must-haves":["Long flowering","Bee & butterfly friendly","Scented","Evergreen","Low maintenance","Safe for pets","Good in pots"],
  "When it looks best":["Spring","Summer","Autumn","Winter interest"]
};
let planDraft=null;        // {area, setting, sun, soil, moisture, wishes:Set, note, photo:{file,dataUrl}}
let planResult=null;       // {result, photos, draft}
let planBusy=false;

function plannerBanner(){
  return `<button class="planner-banner" onclick="openPlanner()">
    <span class="planner-mark">✦</span><span><strong>What should I plant here?</strong><small>Ideas for any spot in your garden, chosen for its light, soil and what already grows there.</small></span><b>→</b></button>`;
}
function openPlanner(area){
  if(area) return startPlanner(area);
  const areas=state.areas.filter(a=>a!=="Unplaced");
  if(!areas.length){ toast("Add a garden area first"); return; }
  modal(`<div class="eyebrow">What should I plant here?</div><h2>Which spot?</h2><p class="sub">Choose the area you'd like ideas for.</p>
    <div class="area-grid">${areas.map(a=>`<button class="area-choice" onclick="closeModal();startPlanner(decodeURIComponent('${jsArg(a)}'))">${esc(a)}</button>`).join("")}</div>`);
}
function guessSetting(area){
  const m=areaMood(area).cls;
  return m==="indoor"?"Indoors":m==="patio"?"In pots":"In the ground";
}
function startPlanner(area){
  const saved=(state.areaInfo||{})[area]||{};
  planDraft={area,setting:saved.setting||guessSetting(area),sun:saved.sun||"Not sure",soil:saved.soil||"Not sure",moisture:saved.moisture||"Average",
    wishes:new Set(saved.lastWishes||[]),note:"",photo:null};
  renderPlannerForm();
}
function planPick(field,val){ if(!planDraft) return; planDraft[field]=val; renderPlannerForm(true); }
function planWish(val){ if(!planDraft) return; planDraft.wishes.has(val)?planDraft.wishes.delete(val):planDraft.wishes.add(val); renderPlannerForm(true); }
function planPhoto(){
  let inp=document.getElementById("planPhotoInput");
  if(!inp){ inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.setAttribute("capture","environment"); inp.hidden=true; inp.id="planPhotoInput"; document.body.appendChild(inp); }
  inp.onchange=async e=>{ const f=e.target.files?.[0]; e.target.value=""; if(f&&planDraft){ planDraft.photo={file:f,dataUrl:await fileToDataUrl(f)}; renderPlannerForm(true); } };
  inp.click();
}
function renderPlannerForm(keepScroll=false){
  const d=planDraft; if(!d) return;
  const y=keepScroll?appScrollTop():0;
  currentRoute="garden";
  const inArea=state.plants.filter(p=>p.area===d.area);
  const seg=(field,opts)=>`<div class="plan-seg">${opts.map(o=>`<button class="${d[field]===o?"on":""}" onclick="planPick('${field}',decodeURIComponent('${jsArg(o)}'))">${esc(o)}</button>`).join("")}</div>`;
  view.innerHTML=`<section class="page-head profile-back"><button class="link-btn" onclick="planDraft=null;setRoute('garden')">← My Garden</button></section>
    <section class="planner-hero"><span>${areaMood(d.area).icon}</span><div><div class="eyebrow">What should I plant here?</div><h1>${esc(d.area)}</h1>
      <p>${inArea.length?`Already growing: ${inArea.slice(0,4).map(p=>esc(p.common)).join(", ")}${inArea.length>4?` and ${inArea.length-4} more`:""}`:"Nothing planted here yet"}</p></div></section>
    <section class="plan-block"><h3>About this spot</h3><p class="small">FloraLens remembers this for next time.</p>
      <label class="plan-label">Where</label>${seg("setting",PLAN_SETTING)}
      <label class="plan-label">Light</label>${seg("sun",PLAN_SUN)}
      ${d.setting==="Indoors"?"":`<label class="plan-label">Soil</label>${seg("soil",PLAN_SOIL)}<label class="plan-label">Moisture</label>${seg("moisture",PLAN_MOIST)}`}
      <label class="plan-label">Photo of the spot <span>(optional)</span></label>
      ${d.photo?`<div class="plan-photo"><img src="${d.photo.dataUrl}" alt="The spot"><button class="capture-remove" aria-label="Remove photo" onclick="planDraft.photo=null;renderPlannerForm(true)">×</button></div>`
        :`<button class="plan-photo-add" onclick="planPhoto()">📷 Add a photo, so Gemini can see the space</button>`}
    </section>
    <section class="plan-block"><h3>What would you love?</h3><p class="small">Pick as many as you like, or none.</p>
      ${Object.entries(PLAN_WISHES).map(([group,opts])=>`<label class="plan-label">${group}</label><div class="plan-chips">${opts.map(o=>`<button class="${d.wishes.has(o)?"on":""}" onclick="planWish(decodeURIComponent('${jsArg(o)}'))">${esc(o)}</button>`).join("")}</div>`).join("")}
      <label class="plan-label" for="planNote">Anything else?</label>
      <textarea id="planNote" class="journal-field journal-textarea" maxlength="300" placeholder="e.g. something to hide the fence, cottage-garden feel" oninput="planDraft.note=this.value">${esc(d.note)}</textarea>
    </section>
    <button class="btn primary" style="width:100%" onclick="runPlanner()">✦ Suggest plants</button>`;
  if(keepScroll) appScrollTo(y); else appScrollTo(0);
}
async function runPlanner(exclude=[]){
  const d=planDraft; if(!d||planBusy) return;
  if(!API_PROXY_URL){ toast("Plant ideas need the FloraLens Worker"); return; }
  planBusy=true;
  state.areaInfo=state.areaInfo||{};
  state.areaInfo[d.area]={setting:d.setting,sun:d.sun,soil:d.soil,moisture:d.moisture,lastWishes:[...d.wishes]};
  saveState();
  view.innerHTML=`<section class="page-head profile-back"><button class="link-btn" onclick="renderPlannerForm()">← ${esc(d.area)}</button></section>
    <div class="lookup-loading planner-loading"><div class="flower-loader">✦</div><h2>Finding plants for ${esc(d.area)}</h2><p class="sub">Matching the light, soil and what already grows there. This takes a few seconds.</p></div>`;
  appScrollTo(0);
  try{
    const body={
      area:d.area,setting:d.setting,sun:d.sun,soil:d.setting==="Indoors"?"":d.soil,moisture:d.setting==="Indoors"?"":d.moisture,
      wishes:[...d.wishes],note:d.note.trim(),
      inArea:state.plants.filter(p=>p.area===d.area).map(p=>`${p.common} (${p.scientific})`),
      garden:state.plants.filter(p=>p.area!==d.area).map(p=>p.common),
      exclude,today:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),
      image:d.photo?await doctorImagePayload(d.photo.file):null
    };
    const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data=await res.json().catch(()=>null);
    if(!data) throw new Error(res.status===404?"The Worker doesn't have a /suggest route yet. Upload the new worker.js.":`Suggestions failed (${res.status}).`);
    if(!res.ok||data.error){ if(res.status===429||res.status===402) noteGeminiPause(data); throw new Error(data.error||`Suggestions failed (${res.status}).`); }
    clearGeminiPause();
    planResult={...data,excluded:exclude};
    planBusy=false;
    renderPlannerResult();
  }catch(err){
    planBusy=false;
    view.innerHTML=`<section class="page-head profile-back"><button class="link-btn" onclick="renderPlannerForm()">← ${esc(d.area)}</button></section>
      <section class="ai-verdict ai-unclear"><div class="ai-verdict-top"><span class="ai-pill">Couldn't get ideas</span></div><h2>Something went wrong</h2><p>${esc(friendlyNetError(err,"Plant ideas"))}</p></section>
      <div class="actions" style="margin-top:16px"><button class="btn primary" onclick="runPlanner()">↻ Try again</button><button class="btn secondary" onclick="renderPlannerForm()">Back</button></div>`;
  }
}
function planOnWishlist(s){ const k=slug(s.scientific); return state.discoveries.some(d=>d.speciesKey===k)||state.plants.some(p=>p.speciesKey===k); }
function renderPlannerResult(){
  const d=planDraft, R=planResult; if(!d||!R) return renderGarden();
  const list=R.result?.suggestions||[];
  view.innerHTML=`<section class="page-head profile-back"><button class="link-btn" onclick="renderPlannerForm()">← Change what I asked for</button></section>
    <section class="page-head" style="padding-top:0"><div class="eyebrow">Ideas for ${esc(d.area)}</div><h1>${list.length} plants that would suit</h1>
      <p class="sub">${esc([d.setting,d.sun!=="Not sure"?d.sun.toLowerCase():"",d.setting!=="Indoors"&&d.soil!=="Not sure"?d.soil.toLowerCase()+" soil":""].filter(Boolean).join(" · "))}${d.wishes.size?` · ${esc([...d.wishes].join(", ").toLowerCase())}`:""}</p></section>
    ${d.photo&&R.result?.read_of_spot?`<div class="ai-note planner-read"><span>📷</span><p><i>From your photo:</i> ${esc(R.result.read_of_spot)}</p></div>`:""}
    <section class="plan-results">${list.map((s,i)=>{
      const ph=R.photos?.[i]; const on=planOnWishlist(s); const months=(s.flowering||[]).map(Number);
      return `<article class="plan-card">
        <div class="plan-card-photo">${ph?.url?`<img src="${esc(ph.url)}" data-fallback="${esc(ph.fallback||"")}" alt="${esc(s.common)}" loading="lazy" onerror="lookupImgFallback(this)">`:`<div class="plant-art"></div>`}
          <span class="plan-care ${s.care==="Easy"?"easy":s.care==="Needs care"?"hard":""}">${esc(s.care||"")}</span>${s.pet_safe?`<span class="plan-pet">Pet safe</span>`:""}</div>
        <div class="plan-card-body">
          <h3>${esc(s.common)}</h3><em>${esc(s.scientific)}</em>
          <p>${esc(s.why)}</p>
          <div class="plan-facts"><span>↕ ${esc(s.height||"")}</span>${s.plant_when?`<span>🌱 ${esc(s.plant_when)}</span>`:""}</div>
          ${months.length?`<div class="months plan-months">${LOOKUP_MONTHS.map((m,mi)=>`<div class="month ${months.includes(mi+1)?"on":""}">${m}</div>`).join("")}</div>`:""}
          <div class="plan-actions">
            <button class="btn ${on?"secondary":"primary"}" ${on?"disabled":""} onclick="planToWishlist(${i},this)">${on?"✓ On your list":"♡ Wishlist"}</button>
            <button class="btn outline" onclick="lookupFrom='planner';lookupPlant(decodeURIComponent('${jsArg(s.scientific)}'))">Full details</button>
          </div>
          ${ph?.credit?`<small class="plan-credit">Photo: ${esc(ph.credit)}</small>`:""}
        </div></article>`;}).join("")}</section>
    ${R.result?.tip?`<div class="ai-tip"><span>🌱</span><div><small>Preparing the spot</small><p>${esc(R.result.tip)}</p></div></div>`:""}
    <div class="actions" style="margin-top:16px"><button class="btn primary" onclick="runPlanner(${jsArgList([...(R.excluded||[]),...list.map(s=>s.scientific)])})">↻ Different ideas</button><button class="btn secondary" onclick="planDraft=null;setRoute('garden')">Done</button></div>
    <p class="ai-foot">Ideas from Google Gemini, chosen for this spot. Photos are reference photos from iNaturalist or Wikipedia.</p>`;
  appScrollTo(0);
}
function jsArgList(arr){ return `JSON.parse(decodeURIComponent('${jsArg(JSON.stringify(arr))}'))`; }
async function planToWishlist(i,btn){
  const d=planDraft, s=planResult?.result?.suggestions?.[i], ph=planResult?.photos?.[i];
  if(!s||planOnWishlist(s)) return;
  if(btn){ btn.disabled=true; btn.textContent="Saving…"; }
  const id="discovery-"+Date.now(), photoKey=`${id}-hero`, speciesKey=slug(s.scientific);
  const stored=ph?await storeReferencePhoto(ph,photoKey):false;
  if(!state.speciesCache[speciesKey]) state.speciesCache[speciesKey]={scientific:s.scientific,common:s.common,family:"",source:"Garden planner",fetchedAt:new Date().toISOString(),enrichment:null};
  state.discoveries.unshift({
    id,speciesKey,photoKey:stored?photoKey:"",photoUrl:!stored&&ph?.url?ph.url:null,
    common:s.common||s.scientific,scientific:s.scientific,family:"",score:null,spotted:new Date().toISOString(),wishlist:true,
    note:`Idea for ${d.area}: ${s.why||""}`.trim(),source:"lookup",species:s.species||"",plannedArea:d.area,
    stockPhoto:!!(stored||ph?.url),photoCredit:ph?(ph.credit||ph.source):null
  });
  saveState();
  if(btn){ btn.textContent="✓ On your list"; btn.className="btn secondary"; }
  toast(`${s.common} added to your wishlist`);
  setTimeout(fillGardenGaps,1500);   // real sources + Gemini gap-fill for its care details
}

function renderGarden(){
  const isMap=state.gardenView==="map";
  view.innerHTML=`<section class="page-head"><div class="eyebrow">My collection</div><h1>My Garden</h1><p class="sub">${state.plants.length} plants across ${state.areas.filter(x=>x!=="Unplaced").length} named spaces.</p></section>
    <div class="garden-view-switch">
      <button class="${!isMap?"active":""}" onclick="setGardenView('gallery')">▦ Gallery</button>
      <button class="${isMap?"active":""}" onclick="setGardenView('map')">⌂ Garden Map</button>
    </div>
    ${plannerBanner()}
    ${isMap?gardenMapMarkup():gardenGalleryMarkup()}`;
  hydratePhotos();
}
function setGardenView(mode){
  state.gardenView=mode==="map"?"map":"gallery";
  saveState();
  renderGarden();
}
function gardenGalleryMarkup(){
  return `<input class="search" id="gardenSearch" placeholder="Search your plants…" oninput="filterGarden(this.value)">
    <div class="toolbar">${["All",...state.areas].map((a,i)=>`<button class="filter ${i===0?"active":""}" onclick="filterByArea(decodeURIComponent('${jsArg(a)}'),this)">${esc(a)}</button>`).join("")}</div>
    <section class="masonry" id="gardenPins">${state.plants.map(p=>pin(p,{canDelete:true})).join("")}</section>`;
}
function areaMood(area){
  const s=String(area).toLowerCase();
  if(/indoor|house|kitchen|bedroom|living|conservatory/.test(s)) return {icon:"⌂",cls:"indoor",note:"Indoor collection"};
  if(/patio|terrace|deck|pot|container/.test(s)) return {icon:"◌",cls:"patio",note:"Pots & containers"};
  if(/greenhouse|glasshouse/.test(s)) return {icon:"◇",cls:"glass",note:"Under glass"};
  if(/front/.test(s)) return {icon:"❀",cls:"front",note:"Front garden"};
  if(/border|bed/.test(s)) return {icon:"❧",cls:"border",note:"Planting bed"};
  if(/back|garden|lawn/.test(s)) return {icon:"✿",cls:"garden",note:"Outdoor space"};
  if(/unplaced/.test(s)) return {icon:"?",cls:"unplaced",note:"Needs a home"};
  return {icon:"❦",cls:"other",note:"Garden area"};
}
function gardenMapMarkup(){
  const areas=[...state.areas];
  const empty=areas.filter(area=>!state.plants.some(p=>p.area===area)).length;
  return `<section class="map-intro">
      <div><div class="eyebrow">Your spaces</div><h2>A map made from the way you organise your garden.</h2><p>Tap an area to open it. Tap a plant marker to jump straight to that plant.</p></div>
      <button class="map-add-area" onclick="addAreaFromMap()">＋ Area</button>
    </section>
    <div class="map-summary"><span><b>${areas.length}</b> spaces</span><span><b>${state.plants.length}</b> plants</span><span><b>${empty}</b> empty</span></div>
    <section class="garden-map">
      ${areas.map((area,i)=>gardenZone(area,i)).join("")}
    </section>
    <div class="map-footnote"><span>❧</span><p><b>Think in spaces, not coordinates.</b><br>FloraLens maps the garden the same way you naturally describe it: patio, border, greenhouse, kitchen, front garden and so on.</p></div>`;
}
function gardenZone(area,index){
  const plants=state.plants.filter(p=>p.area===area);
  const mood=areaMood(area);
  const limit=5;
  return `<article class="garden-zone ${mood.cls}" onclick="openAreaMap(decodeURIComponent('${jsArg(area)}'))">
    <div class="zone-top"><span class="zone-icon">${mood.icon}</span><button class="zone-menu" onclick="event.stopPropagation();areaMenu(decodeURIComponent('${jsArg(area)}'))">•••</button></div>
    <div class="zone-copy"><div class="eyebrow">${esc(mood.note)}</div><h2>${esc(area)}</h2><p>${plants.length} ${plants.length===1?"plant":"plants"}</p></div>
    <div class="zone-plants">
      ${plants.slice(0,limit).map((p,pi)=>`<button class="map-plant map-plant-${pi+1}" onclick="event.stopPropagation();setRoute('profile',{id:'${p.id}'})" title="${esc(p.common)}"><span class="map-plant-photo ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}"></span><small>${esc(p.common)}</small></button>`).join("")}
      ${plants.length>limit?`<span class="map-more">+${plants.length-limit}</span>`:""}
      ${!plants.length?`<div class="zone-empty">A quiet patch waiting for something lovely.</div>`:""}
    </div>
  </article>`;
}
function openAreaMap(area){
  const plants=state.plants.filter(p=>p.area===area);
  const mood=areaMood(area);
  modal(`<div class="area-detail-head"><span>${mood.icon}</span><div><div class="eyebrow">${esc(mood.note)}</div><h2>${esc(area)}</h2><p class="sub">${plants.length} ${plants.length===1?"plant":"plants"} here</p></div></div>
    ${plants.length?`<div class="area-plant-list">${plants.map(p=>`<button onclick="closeModal();setRoute('profile',{id:'${p.id}'})"><span class="area-list-photo ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}"></span><span><b>${esc(p.common)}</b><small><i>${esc(p.scientific)}</i></small></span><b>→</b></button>`).join("")}</div>`:`<div class="empty-card" style="text-align:center"><p class="sub">There aren't any plants in this area yet.</p></div>`}
    ${area!=="Unplaced"?`<button class="btn primary" style="width:100%;margin-top:12px" onclick="closeModal();openPlanner(decodeURIComponent('${jsArg(area)}'))">✦ What should I plant here?</button>`:""}
    <button class="btn secondary" style="width:100%;margin-top:10px" onclick="closeModal();startCamera('identify')">⌾ Identify a plant</button>`);
  hydratePhotos(document);
}
function addAreaFromMap(){
  modal(`<div class="eyebrow">Garden Map</div><h2>Create a new space</h2><p class="sub">Use the name you naturally use at home — “Rose bed”, “Kitchen window”, “Back patio”…</p><input id="mapNewArea" class="search" placeholder="Name this area"><button class="btn primary" style="width:100%" onclick="saveMapArea()">Add to map</button>`);
}
function saveMapArea(){
  const name=(document.getElementById("mapNewArea")?.value||"").trim();
  if(!name) return;
  if(state.areas.some(a=>a.toLowerCase()===name.toLowerCase())){toast("That area already exists");return}
  state.areas.splice(Math.max(0,state.areas.length-1),0,name);
  saveState();closeModal();toast(`${name} added`);renderGarden();
}
function areaMenu(area){
  const plants=state.plants.filter(p=>p.area===area);
  modal(`<div class="eyebrow">Garden area</div><h2>${esc(area)}</h2>
    <button class="destination-choice" onclick="renameAreaPrompt(decodeURIComponent('${jsArg(area)}'))"><span>✎</span><div><b>Rename area</b><small>Update this name everywhere in My Garden.</small></div></button>
    ${area!=="Unplaced"?`<button class="destination-choice" onclick="closeModal();startCamera('identify')"><span>⌾</span><div><b>Add another plant</b><small>Identify something and save it to this space.</small></div></button>`:""}
    ${area!=="Unplaced"?`<button class="destination-choice" onclick="closeModal();openPlanner(decodeURIComponent('${jsArg(area)}'))"><span>✦</span><div><b>What should I plant here?</b><small>Ideas that suit this spot's light, soil and neighbours.</small></div></button>`:""}
    ${area!=="Unplaced"?`<button class="link-btn discovery-delete-link" style="width:100%" onclick="deleteAreaPrompt(decodeURIComponent('${jsArg(area)}'))">Remove area${plants.length?` (${plants.length} plants move to Unplaced)`:""}</button>`:""}`);
}
function renameAreaPrompt(area){
  modal(`<div class="eyebrow">Garden area</div><h2>Rename ${esc(area)}</h2><input id="renameArea" class="search" value="${esc(area)}"><button class="btn primary" style="width:100%" onclick="saveAreaRename(decodeURIComponent('${jsArg(area)}'))">Save name</button>`);
}
function saveAreaRename(oldName){
  const name=(document.getElementById("renameArea")?.value||"").trim();
  if(!name||name===oldName){closeModal();return}
  if(state.areas.some(a=>a!==oldName&&a.toLowerCase()===name.toLowerCase())){toast("That area already exists");return}
  state.areas=state.areas.map(a=>a===oldName?name:a);
  state.plants.forEach(p=>{if(p.area===oldName)p.area=name});
  if(state.areaInfo?.[oldName]){ state.areaInfo[name]=state.areaInfo[oldName]; delete state.areaInfo[oldName]; }
  state.discoveries.forEach(d=>{ if(d.plannedArea===oldName) d.plannedArea=name; });
  saveState();closeModal();toast("Area renamed");renderGarden();
}
function deleteAreaPrompt(area){
  const count=state.plants.filter(p=>p.area===area).length;
  modal(`<div class="eyebrow">Garden Map</div><h2>Remove ${esc(area)}?</h2><p class="sub">${count?`${count} ${count===1?"plant":"plants"} will be kept safely and moved to Unplaced.`:"This removes the empty area from your map."}</p><div class="actions"><button class="btn secondary" onclick="closeModal()">Keep it</button><button class="btn danger" onclick="deleteGardenArea(decodeURIComponent('${jsArg(area)}'))">Remove area</button></div>`);
}
function deleteGardenArea(area){
  if(area==="Unplaced")return;
  state.plants.forEach(p=>{if(p.area===area)p.area="Unplaced"});
  state.areas=state.areas.filter(a=>a!==area);
  if(!state.areas.includes("Unplaced"))state.areas.push("Unplaced");
  saveState();closeModal();toast("Area removed");renderGarden();
}
function filterGarden(q){
  const list=state.plants.filter(p=>(p.common+p.scientific+p.area).toLowerCase().includes(q.toLowerCase()));
  gardenPins.innerHTML=list.map(p=>pin(p,{canDelete:true})).join("") || `<div class="empty-card">No plants matched that search.</div>`;
  hydratePhotos(gardenPins);
}
function filterByArea(area,btn){
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  const list=area==="All"?state.plants:state.plants.filter(p=>p.area===area);
  gardenPins.innerHTML=list.map(p=>pin(p,{canDelete:true})).join("") || `<div class="empty-card">Nothing saved in ${esc(area)} yet.</div>`;
  hydratePhotos(gardenPins);
}

function startCamera(intent="identify"){
  captures=[];
  pendingResults=null;
  captureIntent=intent;
  window.captureOrgan="auto";
  // Called directly from a user tap so iOS opens the rear camera immediately.
  cameraInput.click();
}

function renderLens(){
  captures=[];
  pendingResults=null;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>What would you like to do?</h1><p class="sub">Identify something new, or take a closer look at a plant that doesn't seem quite right.</p></section>
    <section class="lens-choice-grid">
      <button class="lens-choice-card identify-choice" onclick="startCamera('identify')">
        <span class="lens-choice-mark">⌾</span>
        <span><small>FloraLens</small><strong>Identify a plant</strong><em>Use Pl@ntNet to recognise a flower or plant.</em></span>
        <b>→</b>
      </button>
      <button class="lens-choice-card doctor-choice" onclick="openPlantDoctor()">
        <span class="lens-choice-mark">✚</span>
        <span><small>AI health check</small><strong>Plant Doctor</strong><em>Photograph a poorly plant to find out what's wrong and what to do.</em></span>
        <b>→</b>
      </button>
    </section>
    <div class="doctor-note"><span>❧</span><p><b>It already knows your plant.</b><br>Plant Doctor uses the plant's care record and your journal notes, so you only need the photos.</p></div>`;
}
function beginCapture(organ="auto"){ window.captureOrgan=organ; multiPhotoInput.click(); }

async function addCapture(file, organ="auto"){
  if(!file || captures.length>=5) return;
  if(!["image/jpeg","image/png"].includes(file.type)){ toast("Use a JPG or PNG photo."); return; }
  const dataUrl=await fileToDataUrl(file);
  captures.push({id:crypto.randomUUID?.()||String(Date.now()+Math.random()),file,dataUrl,organ});
  renderCaptureReview();
}
function fileToDataUrl(file){ return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);}); }

function renderCaptureReview(){
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Closer look</div><h1>${captures.length===1?"Lovely shot.":"More clues."}</h1><p class="sub">Label each view if you know the plant part, or leave it on Auto.</p></section>
    <div class="capture-stack">${captures.map((c,i)=>`<div class="capture-card"><button class="capture-remove" onclick="removeCapture(${i})">×</button><img src="${c.dataUrl}"><span class="organ">${esc(c.organ)}</span></div>`).join("")}${captures.length<5?`<button class="add-capture" onclick="chooseOrganForNext()">＋<br>Add view</button>`:""}</div>
    <div class="result-hero" style="min-height:330px"><img class="preview-img" src="${captures[0].dataUrl}"><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${captures.length} of 5 photos</div><h1>Ready to identify?</h1><span class="confidence">${captures.map(c=>c.organ).join(" · ")}</span></div></div>
    <div class="actions"><button class="btn primary" onclick="identifyPlant()">✿ Identify plant</button><button class="btn secondary" onclick="chooseOrganForNext()" ${captures.length>=5?"disabled":""}>＋ Another view</button></div>
    <button class="btn outline" style="width:100%" onclick="startCamera(captureIntent)">Start again</button>
    ${!API_PROXY_URL?`<div class="setup-card"><div class="eyebrow">Demo mode</div><p class="sub" style="margin:6px 0 0">The complete flow works now. Deploy the included free Cloudflare Worker and set <code>API_PROXY_URL</code> to switch on real Pl@ntNet results.</p></div>`:""}`;
}
function removeCapture(i){ captures.splice(i,1); captures.length?renderCaptureReview():startCamera(captureIntent); }
function chooseOrganForNext(){
  if(captures.length>=5) return;
  modal(`<div class="eyebrow">Add another view</div><h2>What will you photograph?</h2><div class="organ-grid">
    <button class="organ-choice" onclick="pickOrgan('flower')"><span>✿</span>Flower</button>
    <button class="organ-choice" onclick="pickOrgan('leaf')"><span>❧</span>Leaf</button>
    <button class="organ-choice" onclick="pickOrgan('fruit')"><span>●</span>Fruit</button>
    <button class="organ-choice" onclick="pickOrgan('bark')"><span>♜</span>Bark</button>
    <button class="organ-choice" onclick="pickOrgan('auto')"><span>⌾</span>Auto</button>
  </div><p class="small">All photos in one identification should be of the same individual plant.</p>`);
}
function pickOrgan(o){ closeModal(); beginCapture(o); }

async function identifyPlant(){
  if(!captures.length) return;
  const first=captures[0].dataUrl;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>Looking closely…</h1></section><div class="result-hero"><img class="preview-img" src="${first}"><div class="identify-overlay"><div><div class="flower-loader">✿</div><h2 style="margin:12px 0 5px">Comparing the details</h2><p style="opacity:.8">${captures.length} ${captures.length===1?"view":"views"} of the same plant.</p></div></div></div>`;
  try{
    if(API_PROXY_URL){
      const fd=new FormData();
      captures.forEach(c=>{ fd.append("images",c.file,c.file.name||"plant.jpg"); fd.append("organs",c.organ); });
      fd.append("lang","en");
      fd.append("nb-results","5");
      const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/identify`,{method:"POST",body:fd});
      if(!res.ok) throw new Error(`Identification failed (${res.status})`);
      const data=await res.json();
      pendingResults=data.results||[];
      if(Number.isFinite(data.remainingIdentificationRequests)){state.lastQuota=data.remainingIdentificationRequests;saveState();}
    } else {
      await new Promise(r=>setTimeout(r,1150));
      pendingResults=[
        {score:.963,species:{scientificNameWithoutAuthor:"Lavandula angustifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["English Lavender","True Lavender"]}},
        {score:.742,species:{scientificNameWithoutAuthor:"Lavandula latifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["Spike Lavender"]}},
        {score:.516,species:{scientificNameWithoutAuthor:"Lavandula × intermedia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["Lavandin"]}}
      ];
    }
    if(!pendingResults.length) throw new Error("No plant match was returned");
    renderResult();
  }catch(err){
    view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>Couldn’t settle on a match</h1><p class="sub">${esc(friendlyNetError(err,"Identifying a plant"))}</p></section><button class="btn primary" style="width:100%" onclick="renderCaptureReview()">Try these photos again</button>`;
  }
}

function resultInfo(r){
  const s=r?.species||{};
  return {common:s.commonNames?.[0]||s.scientificNameWithoutAuthor||"Possible match", sci:s.scientificNameWithoutAuthor||"", family:s.family?.scientificNameWithoutAuthor||"Plant", genus:s.genus?.scientificNameWithoutAuthor||""};
}
function renderResult(){
  const r=pendingResults[0], info=resultInfo(r);
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens match</div><h1>I think I found it!</h1>${state.lastQuota!==null?`<span class="quota-pill">❧ ${state.lastQuota} identifications left today</span>`:""}</section>
    <div class="result-hero"><img class="preview-img" src="${captures[0].dataUrl}"><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${esc(info.family)}</div><h1>${esc(info.common)}</h1><em>${esc(info.sci)}</em><br><span class="confidence">${Math.round(r.score*100)}% match</span></div></div>
    <div class="actions">
      ${captureIntent==="discover"
        ? `<button class="btn primary" onclick="saveDiscovery()">♡ Save to Discover</button><button class="btn secondary" onclick="chooseSaveArea()">Add to Garden</button>`
        : `<button class="btn primary" onclick="chooseDestination()">✓ That’s it</button><button class="btn secondary" onclick="showMatches()">Other matches</button>`}
    </div>
    ${captureIntent==="discover"?`<button class="link-btn" style="width:100%;margin:8px 0 2px" onclick="finishWithoutSaving()">Just looking — don't save</button>`:""}
    <div class="profile-card"><div class="eyebrow">Identification evidence</div><h2 style="font-size:25px;margin-top:7px">${captures.length} ${captures.length===1?"photo":"photos"} considered</h2><div class="photo-strip">${captures.map(c=>`<div><img class="thumb" src="${c.dataUrl}"><div class="small" style="text-align:center">${esc(c.organ)}</div></div>`).join("")}</div><p class="small">Confidence is Pl@ntNet's ranked identification score, not a guarantee. Confirming the visual match keeps FloraLens's garden records cleaner.</p></div>`;
}
function showMatches(){
  modal(`<div class="eyebrow">Possible matches</div><h2>What looks right?</h2>${pendingResults.slice(0,5).map((r,i)=>{const x=resultInfo(r);return `<button class="match-card" onclick="selectMatch(${i})"><span><b>${esc(x.common)}</b><br><small><i>${esc(x.sci)}</i> · ${esc(x.family)}</small></span><span class="match-score">${Math.round(r.score*100)}%</span></button>`}).join("")}`);
}
function selectMatch(i){ pendingResults=[pendingResults[i],...pendingResults.filter((_,x)=>x!==i)]; closeModal(); renderResult(); }

function chooseDestination(){
  modal(`<div class="eyebrow">Keep this one?</div><h2>Where should it go?</h2>
    <button class="destination-choice" onclick="closeModal();chooseSaveArea()"><span>⌂</span><div><b>Add to My Garden</b><small>A plant you own — choose its area and keep a care record.</small></div></button>
    <button class="destination-choice" onclick="closeModal();saveDiscovery()"><span>♡</span><div><b>Save to Discover</b><small>Something you spotted, liked or might buy later.</small></div></button>
    <button class="link-btn" style="width:100%;margin-top:14px" onclick="finishWithoutSaving()">Just looking — don't save</button>`);
}

function finishWithoutSaving(){
  closeModal();
  captures=[];
  pendingResults=null;
  toast("Identification complete");
  setRoute(captureIntent==="discover"?"discover":"home");
}

function chooseSaveArea(){
  chosenArea="Unplaced";
  modal(`<div class="eyebrow">Add to My Garden</div><h2>Where does it live?</h2><div class="area-grid">${state.areas.map(a=>`<button class="area-choice ${a===chosenArea?"active":""}" onclick="selectArea(decodeURIComponent('${jsArg(a)}'),this)">${esc(a)}</button>`).join("")}</div><button class="btn primary" style="width:100%" onclick="confirmPlant()">Save this plant</button><button class="link-btn" style="width:100%;margin-top:12px" onclick="addAreaPrompt()">＋ Create an area</button>`);
}
function selectArea(a,btn){ chosenArea=a; document.querySelectorAll(".area-choice").forEach(x=>x.classList.remove("active"));btn.classList.add("active"); }
function addAreaPrompt(){
  closeModal();
  modal(`<div class="eyebrow">Garden areas</div><h2>Create a new area</h2><input id="newArea" class="search" placeholder="e.g. Rose bed"><button class="btn primary" style="width:100%" onclick="saveNewArea()">Add area</button>`);
}
function saveNewArea(){ const a=document.getElementById("newArea").value.trim();if(!a)return;if(!state.areas.includes(a))state.areas.push(a);saveState();chosenArea=a;closeModal();chooseSaveArea(); }

async function saveDiscovery(){
  const r=pendingResults?.[0];
  if(!r) return;
  const x=resultInfo(r);
  const speciesKey=slug(x.sci);
  if(!state.speciesCache[speciesKey]){
    state.speciesCache[speciesKey]={
      scientific:x.sci,common:x.common,family:x.family,genus:x.genus,
      source:"Pl@ntNet identification",fetchedAt:new Date().toISOString(),enrichment:null
    };
  }

  const looked=state.discoveries.find(d=>d.speciesKey===speciesKey&&d.stockPhoto);
  if(looked){
    const buyFiles=captures.slice(0,3).map(c=>c.file);
    await replaceStockPhotos(speciesKey,captures[0].file);
    looked.score=Math.round((r.score||0)*100); looked.spotted=new Date().toISOString(); delete looked.buyCheck;
    saveState(); captures=[]; pendingResults=null;
    toast(`Your photo of ${looked.common} replaced the reference photo`);
    runBuyCheck(looked.id,{files:buyFiles});
    setRoute("discover");
    return;
  }
  const id="discovery-"+Date.now();
  const photoKey=`${id}-hero`;
  try{ await savePhoto(photoKey,captures[0].file); }catch(e){ console.warn("Discovery photo storage failed",e); }

  state.discoveries.unshift({
    id, speciesKey, photoKey,
    common:x.common, scientific:x.sci, family:x.family,
    score:Math.round((r.score||0)*100),
    spotted:new Date().toISOString(),
    wishlist:false,
    note:""
  });
  saveState();
  const buyFiles=captures.slice(0,3).map(c=>c.file);
  captures=[];
  pendingResults=null;
  toast(`${x.common} saved to Discover`);
  runBuyCheck(id,{files:buyFiles});   // "Should I buy it?" runs in the background

  // Enrich once so its Discover detail page has the same knowledge as Garden plants.
  if(!state.speciesCache[speciesKey]?.enrichment){
    enrichSpecies(x.sci,speciesKey).catch(()=>{});
  }
  setRoute("discover");
}

/* ===================== "Should I buy it?" (Discover, via Gemini) ===================== */
const BUY_RATING={
  great:{cls:"great",label:"Great buy",icon:"✓"},
  good:{cls:"good",label:"Good buy",icon:"✓"},
  caution:{cls:"caution",label:"Check first",icon:"!"},
  avoid:{cls:"avoid",label:"Avoid",icon:"×"},
  unclear:{cls:"unclear",label:"Not sure",icon:"?"}
};
const buyCheckInFlight=new Set();

async function getPhotoBlob(key){
  if(!key) return null;
  try{
    const db=await photoDB();
    return await new Promise((resolve,reject)=>{
      const req=db.transaction(PHOTO_STORE,"readonly").objectStore(PHOTO_STORE).get(key);
      req.onsuccess=()=>resolve(req.result||null); req.onerror=()=>reject(req.error);
    });
  }catch{ return null; }
}
function buyContext(d){
  const intel=state.speciesCache[d.speciesKey]?.enrichment||null;
  const care=resolvedCare(d.scientific,intel?.trefle||null,intel?.perenual||null,d.speciesKey);
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return [
    `Plant: ${d.common} (${d.scientific}${d.family?`, ${d.family}`:""})`,
    `Today: ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})} (${currentSeasonName()}), UK`,
    care.growthHabit?`Growth form: ${care.growthHabit}`:null,
    care.hardiness?`Hardiness: ${care.hardiness}`:null,
    care.light?`Light: ${care.light}`:null,
    care.height?`Size: ${care.height}`:null,
    care.bloomMonths?.length?`Usually flowers: ${care.bloomMonths.map(m=>months[m-1]).join(", ")}`:null,
    weatherContextLine()
  ].filter(Boolean).join("\n");
}
async function runBuyCheck(id,{files=null,extraFile=null}={}){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d||buyCheckInFlight.has(id)) return;
  if(!API_PROXY_URL) return;
  if(!navigator.onLine){ d.buyCheckError="You're offline. Check its health once you have a signal."; saveState(); refreshBuyCheckUI(id); return; }
  buyCheckInFlight.add(id); delete d.buyCheckError; refreshBuyCheckUI(id);
  try{
    let list=files;
    if(!list){ const blob=await getPhotoBlob(d.photoKey); list=blob?[blob]:[]; }
    if(extraFile) list=[...list.slice(0,2),extraFile];
    if(!list.length) throw new Error("This discovery has no photo to check.");
    const images=await Promise.all(list.slice(0,3).map(f=>doctorImagePayload(f)));
    const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/buycheck`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({images,context:buyContext(d)})});
    const data=await res.json().catch(()=>null);
    if(!data){ throw new Error(res.status===404?"The Worker doesn't have a /buycheck route yet. Add it from worker-gemini.js.":`The health check failed (${res.status}).`); }
    if(!res.ok||data.error){
      if(res.status===429||res.status===402){ noteGeminiPause(data); throw new Error(data.error||"Gemini's limit is reached for now. Try again later."); }
      throw new Error(data.error||`The health check failed (${res.status}).`);
    }
    d.buyCheck={...data.result,checkedAt:new Date().toISOString(),photos:list.length};
    clearGeminiPause();
    delete d.buyCheckError;
  }catch(err){
    d.buyCheckError=friendlyNetError(err,"The health check");
  }finally{
    buyCheckInFlight.delete(id);
    saveState();
    refreshBuyCheckUI(id);
  }
}
function refreshBuyCheckUI(id){
  const d=state.discoveries.find(x=>x.id===id); if(!d) return;
  const card=document.getElementById(`buy-${id}`); if(card) card.outerHTML=renderBuyCheck(d);
  const badge=document.querySelector(`[data-buy-badge="${id}"]`); if(badge) badge.outerHTML=buyBadge(d);
}
function buyCheckAddPhoto(id){
  let inp=document.getElementById("buyCheckInput");
  if(!inp){ inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.setAttribute("capture","environment"); inp.hidden=true; inp.id="buyCheckInput"; document.body.appendChild(inp); }
  inp.onchange=e=>{ const f=e.target.files?.[0]; e.target.value=""; if(f) runBuyCheck(id,{extraFile:f}); };
  inp.click();
}
function buyBadge(d){
  if(buyCheckInFlight.has(d.id)) return `<span class="buy-badge checking" data-buy-badge="${d.id}"><i></i>Checking…</span>`;
  const r=d.buyCheck&&BUY_RATING[d.buyCheck.rating];
  return r?`<span class="buy-badge ${r.cls}" data-buy-badge="${d.id}">${r.icon} ${r.label}</span>`:`<span data-buy-badge="${d.id}" hidden></span>`;
}
function renderBuyCheck(d){
  const head=`<div class="buy-head"><div><div class="eyebrow">Should I buy it?</div>`;
  if(buyCheckInFlight.has(d.id)){
    return `<section class="buy-card buy-checking" id="buy-${d.id}">${head}<h2>Taking a close look…</h2></div><span class="buy-spin"></span></div><p class="buy-sum">Checking the leaves, stems and compost for anything that should put you off.</p></section>`;
  }
  const b=d.buyCheck;
  if(!b&&d.stockPhoto){
    return `<section class="buy-card buy-empty" id="buy-${d.id}">${head}<h2>Spotted one in a shop?</h2></div><span class="buy-mark">⌾</span></div>
      <p class="buy-sum">Scan it with Identify. Your photo replaces the reference photo, and Gemini checks whether that plant is worth buying.</p>
      <button class="btn primary" style="width:100%;margin-top:12px" onclick="startCamera('discover')">⌾ Scan it</button></section>`;
  }
  if(!b){
    return `<section class="buy-card buy-empty" id="buy-${d.id}">${head}<h2>${d.buyCheckError?"Couldn't check this time":"Check how healthy it looks"}</h2></div><span class="buy-mark">✦</span></div>
      <p class="buy-sum">${esc(d.buyCheckError||"Gemini looks at the photo for pests, disease, damage and pot-bound roots, and tells you whether it's worth buying.")}</p>
      <button class="btn primary" style="width:100%;margin-top:12px" onclick="runBuyCheck('${d.id}')">${d.buyCheckError?"↻ Try again":"✦ Check its health"}</button></section>`;
  }
  const r=BUY_RATING[b.rating]||BUY_RATING.unclear;
  const list=(arr,cls,icon)=>Array.isArray(arr)&&arr.length?`<div class="buy-list ${cls}">${arr.slice(0,4).map(x=>`<div><span>${icon}</span><p>${esc(x)}</p></div>`).join("")}</div>`:"";
  const when=new Date(b.checkedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  return `<section class="buy-card buy-${r.cls}" id="buy-${d.id}">
    ${head}<h2>${esc(b.headline||r.label)}</h2></div><span class="buy-rating">${r.icon}<small>${r.label}</small></span></div>
    ${b.summary?`<p class="buy-sum">${esc(b.summary)}</p>`:""}
    ${b.photo_tip?`<div class="buy-tip photo"><b>📷 A better photo would help</b><p>${esc(b.photo_tip)}</p></div>`:""}
    ${list(b.positives,"pos","✓")}
    ${list(b.concerns,"neg","!")}
    ${Array.isArray(b.check_in_store)&&b.check_in_store.length?`<div class="buy-sub">Before you buy</div>${list(b.check_in_store,"chk","?")}`:""}
    ${b.first_weeks?`<div class="buy-tip"><b>🌱 Once it's home</b><p>${esc(b.first_weeks)}</p></div>`:""}
    <div class="buy-foot"><span>✦ Gemini · ${esc(when)} · ${b.photos||1} photo${(b.photos||1)>1?"s":""}</span><button class="mini-action" onclick="buyCheckAddPhoto('${d.id}')">📷 Add photo &amp; recheck</button></div>
  </section>`;
}

function confirmDeleteDiscovery(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  modal(`<div class="eyebrow">Remove discovery</div><h2>Forget ${esc(d.common)}?</h2>
    <p class="sub">This removes the saved discovery and its photo from this device. Your reusable species knowledge stays cached.</p>
    <div class="actions"><button class="btn secondary" onclick="closeModal()">Keep it</button><button class="btn danger" onclick="deleteDiscovery('${id}')">Delete</button></div>`);
}

async function deleteDiscovery(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  state.discoveries=state.discoveries.filter(x=>x.id!==id);
  saveState();
  closeModal();
  await deletePhoto(d.photoKey);
  toast("Discovery removed");
  renderDiscover();
}

function addDiscoveryToGarden(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  chosenArea=d.plannedArea&&state.areas.includes(d.plannedArea)?d.plannedArea:"Unplaced";
  modal(`<div class="eyebrow">Bring it home</div><h2>Add ${esc(d.common)} to My Garden?</h2>
    <p class="sub">Choose where it lives. The original discovery can stay in Discover as part of the story.</p>
    <div class="area-grid">${state.areas.map(a=>`<button class="area-choice ${a===chosenArea?"active":""}" onclick="selectArea(decodeURIComponent('${jsArg(a)}'),this)">${esc(a)}</button>`).join("")}</div>
    <button class="btn primary" style="width:100%" onclick="confirmDiscoveryToGarden('${id}')">Add to garden</button>`);
}

async function confirmDiscoveryToGarden(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  const cached=state.speciesCache[d.speciesKey]||{};
  const newId="plant-"+Date.now();
  const newPhotoKey=`${newId}-hero`;
  const oldUrl=await getPhotoUrl(d.photoKey);
  if(oldUrl){
    try{
      const blob=await fetch(oldUrl).then(r=>r.blob());
      await savePhoto(newPhotoKey,blob);
      URL.revokeObjectURL(oldUrl);
    }catch(e){ console.warn("Could not copy discovery photo",e); }
  }
  state.plants.unshift({
    id:newId,speciesKey:d.speciesKey,photoKey:newPhotoKey,
    common:d.common,scientific:d.scientific,family:d.family,
    area:chosenArea,status:"New",added:new Date().toISOString().slice(0,10),
    notes:cached.notes||"First spotted in Discover.",
    sun:cached.sun||"Gathering botanical notes…",
    water:cached.water||"Gathering botanical notes…",
    soil:cached.soil||"Gathering botanical notes…",
    height:cached.height||"Gathering botanical notes…",
    bloom:cached.bloom||[],
    stockPhoto:!!d.stockPhoto, photoCredit:d.photoCredit||null,
    ...(d.source==="lookup"&&!oldUrl?{source:"lookup",species:d.species||"",photoUrl:d.photoUrl||null,photoKey:""}:{})
  });
  saveState();
  closeModal();
  toast(`${d.common} added to ${chosenArea}`);
  setRoute("garden");
}

function toggleWishlist(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  d.wishlist=!d.wishlist;
  saveState();
  renderDiscover();
  toast(d.wishlist?"Added to wishlist":"Removed from wishlist");
}

function toggleWishlistFromProfile(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  d.wishlist=!d.wishlist;
  saveState();
  toast(d.wishlist?"Added to wishlist":"Removed from wishlist");
  renderProfile(id);
}


const enrichInFlight=new Map();
function enrichSpecies(scientificName, speciesKey, force=false){
  const k=`${speciesKey}|${force}`;
  if(enrichInFlight.has(k)) return enrichInFlight.get(k);
  const job=enrichSpeciesNow(scientificName,speciesKey,force).finally(()=>enrichInFlight.delete(k));
  enrichInFlight.set(k,job);
  return job;
}
async function enrichSpeciesNow(scientificName, speciesKey, force=false){
  const cached=state.speciesCache[speciesKey]||{};
  if(!force && cached.enrichment?.fetchedAt) return cached.enrichment;
  try{
    const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/enrich?name=${encodeURIComponent(scientificName)}`);
    if(!res.ok) throw new Error(`Botanical notes failed (${res.status})`);
    const data=await res.json();
    const enrichment={...data,fetchedAt:new Date().toISOString()};
    state.speciesCache[speciesKey]={...cached,enrichment,source:[...(data.sources||[]),"Pl@ntNet"].join(" + "),fetchedAt:new Date().toISOString()};
    saveState();
    syncPlantsFromSpecies(speciesKey);
    return enrichment;
  }catch(err){
    console.warn("Enrichment failed",err);
    state.speciesCache[speciesKey]={...cached,enrichmentError:String(err.message||err)};
    saveState();
    return null;
  }
}

function syncPlantsFromSpecies(speciesKey){
  const cache=state.speciesCache[speciesKey];
  if(!cache) return;
  const intel=cache.enrichment||{};
  state.plants.filter(p=>p.speciesKey===speciesKey).forEach(p=>{
    const care=resolvedCare(p.scientific,intel.trefle||null,intel.perenual||null,p.speciesKey);
    if(care.bloomMonths?.length) p.bloom=care.bloomMonths;
    if(care.height) p.height=care.height;
    if(care.light) p.sun=care.light;
    if(care.water) p.water=care.water;
    if(care.soil) p.soil=care.soil;
    const desc=intel.perenual?.description||intel.trefle?.growthDescription||intel.trefle?.observations;
    if(desc) p.notes=desc;
  });
  saveState();
}

async function confirmPlant(){
  const r=pendingResults[0], x=resultInfo(r);
  const speciesKey=slug(x.sci);
  if(!state.speciesCache[speciesKey]){
    state.speciesCache[speciesKey]={scientific:x.sci,common:x.common,family:x.family,genus:x.genus,source:"Pl@ntNet identification",fetchedAt:new Date().toISOString(),enrichment:null};
  }
  const id="plant-"+Date.now(), photoKey=`${id}-hero`;
  try{ await savePhoto(photoKey,captures[0].file); }catch(e){ console.warn("Photo storage failed",e); }
  replaceStockPhotos(speciesKey,captures[0].file).catch(()=>{});
  const cached=state.speciesCache[speciesKey]||{};
  state.plants.unshift({id,speciesKey,photoKey,common:x.common,scientific:x.sci,family:x.family,area:chosenArea,status:"New",added:new Date().toISOString().slice(0,10),notes:cached.notes||"Newly identified with FloraLens.",sun:cached.sun||"Gathering botanical notes…",water:cached.water||"Gathering botanical notes…",soil:cached.soil||"Gathering botanical notes…",height:cached.height||"Gathering botanical notes…",bloom:cached.bloom||[]});
  saveState(); closeModal(); captures=[]; toast(`${x.common} saved to ${chosenArea}`);
  await renderProfile(id,true);
  const existing=state.speciesCache[speciesKey]?.enrichment;
  if(!existing){
    const intel=await enrichSpecies(x.sci,speciesKey);
    if(intel){ toast("Botanical notes added"); await renderProfile(id,false); }
  }
}

function monthsToNumbers(months=[]){
  const map={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,september:9,sept:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};
  return months.map(m=>map[String(m).toLowerCase()]).filter(Boolean);
}
function formatHeight(avg,max){
  const vals=[avg,max].filter(v=>typeof v==="number"&&v>0);
  if(!vals.length)return "Not available";
  if(vals.length===1)return vals[0]>=100?`${(vals[0]/100).toFixed(vals[0]%100?1:0)} m`:`${Math.round(vals[0])} cm`;
  const a=vals[0]>=100?`${(vals[0]/100).toFixed(1)} m`:`${Math.round(vals[0])} cm`;
  const b=vals[1]>=100?`${(vals[1]/100).toFixed(1)} m`:`${Math.round(vals[1])} cm`;
  return `${a} avg · ${b} max`;
}
function lightLabel(v){ if(v===null||v===undefined)return "Not available"; if(v>=8)return "Full sun"; if(v>=5)return "Sun to part shade"; if(v>=3)return "Part shade"; return "Shade / low light"; }
function moistureLabel(v){ if(v===null||v===undefined)return "Not available"; if(v<=2)return "Dry / drought-tolerant"; if(v<=4)return "Allow some drying"; if(v<=7)return "Even moisture"; return "Moist to wet"; }
function soilLabel(t){
  const bits=[];
  if(t.phMinimum!==null||t.phMaximum!==null){
    const lo=t.phMinimum??"—", hi=t.phMaximum??"—"; bits.push(`pH ${lo}–${hi}`);
  }
  if(t.soilTexture!==null){
    bits.push(t.soilTexture<=3?"Finer / clay-leaning":t.soilTexture>=7?"Coarser / free-draining":"Balanced texture");
  }
  return bits.join(" · ")||"Not available";
}
function toxicityCopy(t){
  if(!t || !t.toxicity) return null;
  const level=String(t.toxicity).toLowerCase();
  if(level==="none") return "Trefle records no known toxicity in its plant specification.";
  return `Trefle records ${level} relative toxicity. Treat this as a caution flag, not medical or veterinary advice.`;
}
function currentSeasonNote(t,p){
  const month=new Date().getMonth()+1;
  const bloom=monthsToNumbers(t?.bloomMonths||p.bloom||[]);
  const growth=monthsToNumbers(t?.growthMonths||[]);
  if(bloom.includes(month)) return {title:"In its flowering window",text:"This species is recorded as typically blooming around this time of year."};
  if(growth.includes(month)) return {title:"Active growth time",text:"This month falls within the species' recorded active-growth period."};
  if(bloom.length){
    const next=bloom.find(m=>m>month)||bloom[0];
    const names=["","January","February","March","April","May","June","July","August","September","October","November","December"];
    return {title:"Between flowering periods",text:`Its recorded flowering window next includes ${names[next]}.`};
  }
  return {title:"A quieter botanical note",text:"There isn't enough seasonal data yet to give this plant a reliable month-by-month status."};
}
function dataCoverage(t,g){
  const vals=[t?.light,t?.soilHumidity,t?.phMinimum,t?.phMaximum,t?.averageHeightCm,t?.maximumHeightCm,t?.bloomMonths?.length,t?.growthHabit,g?.family,g?.rank];
  const present=vals.filter(v=>v!==null&&v!==undefined&&v!==""&&v!==0).length;
  return Math.round((present/vals.length)*100);
}

async function refreshIntel(id){
  const p=state.plants.find(x=>x.id===id) || state.discoveries.find(x=>x.id===id);
  if(!p) return;
  toast("Refreshing botanical notes…");
  const intel=await enrichSpecies(p.scientific,p.speciesKey,true);
  if(state.speciesCache[p.speciesKey]){ delete state.speciesCache[p.speciesKey].gemini; saveState(); }
  if(intel){ toast("Botanical notes refreshed"); renderProfile(id); }
  else toast("Couldn’t refresh botanical notes");
}


function movePlantPrompt(id){
  const p=state.plants.find(x=>x.id===id);if(!p)return;
  modal(`<div class="eyebrow">Garden Map</div><h2>Move ${esc(p.common)}</h2><p class="sub">Where does this plant live now?</p><div class="area-grid">${state.areas.map(area=>`<button class="area-choice ${area===p.area?"active":""}" onclick="movePlantTo('${p.id}',decodeURIComponent('${jsArg(area)}'))">${esc(area)}</button>`).join("")}</div><button class="link-btn" style="width:100%;margin-top:12px" onclick="addAreaFromMove('${p.id}')">＋ Create a new area</button>`);
}
function movePlantTo(id,area){
  const p=state.plants.find(x=>x.id===id);if(!p)return;
  p.area=area;saveState();closeModal();toast(`${p.common} moved to ${area}`);renderProfile(id);
}
function addAreaFromMove(id){
  modal(`<div class="eyebrow">Garden Map</div><h2>Create a new space</h2><input id="moveNewArea" class="search" placeholder="e.g. Shady border"><button class="btn primary" style="width:100%" onclick="saveMoveArea('${id}')">Create & move plant</button>`);
}
function saveMoveArea(id){
  const name=(document.getElementById("moveNewArea")?.value||"").trim();if(!name)return;
  if(!state.areas.some(a=>a.toLowerCase()===name.toLowerCase()))state.areas.splice(Math.max(0,state.areas.length-1),0,name);
  const actual=state.areas.find(a=>a.toLowerCase()===name.toLowerCase())||name;
  const p=state.plants.find(x=>x.id===id);if(p)p.area=actual;
  saveState();closeModal();toast(`${p?.common||"Plant"} moved to ${actual}`);renderProfile(id);
}

function profileBloomStatus(bloom=[]){
  const now=new Date().getMonth()+1;
  if(bloom.includes(now)) return "Flowering now";
  if(!bloom.length) return "Seasonal record building";
  const next=bloom.find(m=>m>now) ?? bloom[0];
  const names=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `Next flowers ${names[next-1]}`;
}
function setProfileTab(tab){
  document.querySelectorAll('.profile-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.profileTab===tab));
  document.querySelectorAll('.profile-panel').forEach(panel=>panel.classList.toggle('active',panel.dataset.profilePanel===tab));
  const active=document.querySelector(`.profile-panel[data-profile-panel="${tab}"]`);
  if(active) active.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function firstSentence(text="",max=138){
  const clean=String(text||"").replace(/\s+/g," ").trim();
  if(!clean) return "";
  const m=clean.match(/^(.+?[.!?])(?:\s|$)/);
  const sentence=(m?.[1]||clean).trim();
  return sentence.length>max ? `${sentence.slice(0,max-1).trim()}…` : sentence;
}
function monthDistance(from,to){
  return (to-from+12)%12;
}
function plantTodayModel(p,care,isDiscovery=false){
  const now=new Date();
  const month=now.getMonth()+1;
  const season=seasonKey();
  const bloom=Array.isArray(care?.bloomMonths)?care.bloomMonths:[];
  const items=[];
  const add=(icon,title,detail,tone="calm")=>{
    if(!detail||items.some(x=>x.title===title)) return;
    items.push({icon,title,detail:firstSentence(detail,156),tone});
  };

  if(!isDiscovery){
    const today=localISODate(now);
    const tasks=state.careTasks
      .filter(t=>t.plantId===p.id && !t.completed)
      .sort((a,b)=>String(a.due||"").localeCompare(String(b.due||"")));
    const due=tasks.find(t=>t.due && t.due<=today);
    if(due){
      add(careTaskIcon(due.type),"Care job due",`${due.title}${due.notes?` — ${due.notes}`:""}`,"attention");
    }else{
      const next=tasks.find(t=>t.due && daysFromToday(t.due)<=14);
      if(next) add(careTaskIcon(next.type),"Coming up",`${next.title} · ${careDateLabel(next.due)}`,"calm");
    }
  }

  if(bloom.length){
    if(bloom.includes(month)){
      add("✿","Flowering now","This month sits inside the recorded flowering window.","positive");
    }else{
      const future=bloom.map(m=>({m,d:monthDistance(month,m)})).filter(x=>x.d>0).sort((a,b)=>a.d-b.d)[0];
      if(future){
        const names=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const detail=future.d<=3?`The next recorded flowering month is ${names[future.m-1]}.`:`The recorded flowering window is currently closed; next recorded flowering is ${names[future.m-1]}.`;
        add("◌","Flowering status",detail,"calm");
      }
    }
  }

  const water=String(care?.water||p?.water||"").trim();
  const waterLower=water.toLowerCase();
  if(water){
    if(/keep.*moist|evenly moist|consistent moisture|regular|water regularly|lightly moist/.test(waterLower)){
      add("💧","Check moisture","Moisture matters for this plant; check the soil or compost before deciding whether to water.","calm");
    }else if(/dry|low|drought|allow.*dry|free-draining/.test(waterLower)){
      add("💧","Don’t overwater","Its stored guidance favours drying or lower moisture between waterings.","positive");
    }else{
      add("💧","Watering context",water,"calm");
    }
  }

  const hardiness=String(care?.hardiness||"").trim();
  if(["autumn","winter"].includes(season) && /tender|frost[- ]?free|indoors|protect.*frost|minimum temperature/i.test(hardiness)){
    add("❄","Cold protection",hardiness,"attention");
  }

  const pruning=String(care?.pruning||"").trim();
  if(pruning){
    if(bloom.includes(month) && /after flowering|once flowering|post-flowering/i.test(pruning)){
      add("✂","Hold off pruning","The stored pruning guidance says to wait until flowering has finished.","attention");
    }else if(/autumn|winter|spring|summer|after flowering|prune/i.test(pruning)){
      add("✂","Pruning note",pruning,"calm");
    }
  }

  const seasonal=care?.seasonal?.[season];
  if(seasonal) add("❧",`${season[0].toUpperCase()+season.slice(1)} guidance`,seasonal,"positive");

  const limited=items.slice(0,3);
  if(!limited.length){
    limited.push({icon:"✓",title:"Nothing urgent flagged",detail:"FloraLens has no time-sensitive care signal for this plant today.",tone:"positive"});
  }

  const hasAttention=limited.some(x=>x.tone==="attention");
  const hasPositive=limited.some(x=>x.tone==="positive");
  const headline=hasAttention?"A little attention is useful":hasPositive?"Looking settled today":"A quiet day for this plant";
  return {headline,items:limited,isDiscovery,date:now.toLocaleDateString("en-GB",{day:"numeric",month:"short"})};
}
function renderPlantTodayCard(model,p){
  const title=model.isDiscovery?"Care snapshot":"Your plant today";
  const sub=model.isDiscovery?"A practical preview from the care record":"What FloraLens can say from the record you already have";
  return `<section class="plant-today-card"><div class="plant-today-head"><div><div class="eyebrow">${esc(model.date)} · ${model.isDiscovery?"preview":"today"}</div><h2>${title}</h2><p>${esc(sub)}</p></div><span class="plant-today-mark">${model.items.some(x=>x.tone==="attention")?"!":"❧"}</span></div><div class="plant-today-status">${esc(model.headline)}</div><div class="plant-today-list">${model.items.map(item=>`<div class="plant-today-item ${item.tone}"><span>${item.icon}</span><div><b>${esc(item.title)}</b><p>${esc(item.detail)}</p></div></div>`).join("")}</div>${model.isDiscovery?"":`<div class="plant-today-actions"><button class="mini-action" onclick="openCareComposer('${p.id}')">＋ Add care job</button><button class="mini-action" onclick="setRoute('care')">Open Care Calendar →</button></div>`}</section>`;
}


function pruningSeasonMatch(text="",month=new Date().getMonth()+1){
  const t=String(text||"").toLowerCase();
  const inMonths=(arr)=>arr.includes(month);
  if(/late winter|winter.*early spring|late winter or early spring/.test(t)) return inMonths([1,2,3]);
  if(/early spring/.test(t)) return inMonths([2,3,4]);
  if(/spring/.test(t) && !/after flowering/.test(t)) return inMonths([3,4,5]);
  if(/summer/.test(t) && !/after flowering/.test(t)) return inMonths([6,7,8]);
  if(/autumn|fall/.test(t)) return inMonths([9,10,11]);
  if(/winter/.test(t)) return inMonths([12,1,2]);
  return null;
}
function buildPruningAssistant(care,p,bloom=[]){
  const text=String(care?.pruning||"").trim();
  const month=new Date().getMonth()+1;
  const flowering=Array.isArray(bloom) && bloom.includes(month);
  if(!text) return {state:"unknown",label:"No reliable pruning guidance yet",detail:"FloraLens does not have plant-specific pruning guidance for this record, so it will not guess.",guidance:"",icon:"?"};
  const lower=text.toLowerCase();
  const seasonMatch=pruningSeasonMatch(text,month);
  const afterFlowering=/after flowering|once flowering|post-flowering|after the first flush|after first flush/.test(lower);
  const little=/little pruning|needs little pruning|prune only when necessary|usually needs little pruning/.test(lower);
  const avoidHard=/avoid.*hard|avoid cutting hard|avoid heavy|do not.*hard|depends on flowering group|depends on type|timing depends/.test(lower);
  if(afterFlowering && flowering) return {state:"wait",label:"Wait until flowering finishes",detail:"This plant is inside its recorded flowering window and its pruning guidance says to prune after flowering.",guidance:text,icon:"◷"};
  if(afterFlowering && !flowering) return {state:"good",label:"Pruning may be appropriate now",detail:"The stored guidance says to prune after flowering, and this month is outside the recorded flowering window. Check the full guidance before making a hard cut.",guidance:text,icon:"✓"};
  if(seasonMatch===true) return {state:"good",label:"This is within the suggested pruning season",detail:"The current month matches the timing described in FloraLens' pruning guidance.",guidance:text,icon:"✓"};
  if(seasonMatch===false) return {state:"wait",label:"Better to wait",detail:"The current month falls outside the pruning season described in the stored care guidance.",guidance:text,icon:"◷"};
  if(little) return {state:"light",label:"Light tidy only",detail:"This plant normally needs little pruning. Remove damaged or spent growth only where the stored guidance supports it.",guidance:text,icon:"✂"};
  if(avoidHard) return {state:"light",label:"Avoid hard pruning",detail:"The guidance is cautious or type-dependent, so FloraLens recommends only a light tidy unless you know the plant's pruning group.",guidance:text,icon:"!"};
  if(/deadhead|spent flower|spent spike|spent stem/.test(lower)) return {state:"light",label:flowering?"Deadheading is appropriate":"Light flower-stem tidy",detail:"The stored guidance supports removing spent flowers or stems rather than structural pruning.",guidance:text,icon:"✂"};
  return {state:"caution",label:"Check the guidance before pruning",detail:"FloraLens has pruning information, but it does not contain a sufficiently clear timing rule to give a confident yes/no answer today.",guidance:text,icon:"✂"};
}
function renderPruningAssistant(model,p){
  const tone={good:"positive",wait:"attention",light:"calm",caution:"calm",unknown:"muted"}[model.state]||"calm";
  const encoded=jsArg(model.guidance||"");
  return `<section class="pruning-assistant ${tone}"><div class="pruning-assistant-head"><div><div class="eyebrow">Pruning assistant</div><h2>Can I prune this now?</h2></div><span>${model.icon}</span></div><div class="pruning-verdict">${esc(model.label)}</div><p>${esc(model.detail)}</p>${model.guidance?`<div class="pruning-actions"><button class="mini-action" onclick="showPruningGuidance('${encoded}','${p.id}')">Why? / Full guidance</button></div>`:""}</section>`;
}
function showPruningGuidance(encoded='',plantId=''){
  const text=decodeURIComponent(encoded||'');
  const p=state.plants.find(x=>x.id===plantId)||state.discoveries.find(x=>x.id===plantId);
  modal(`<div class="eyebrow">Pruning assistant</div><h2>${esc(p?.common||"Plant")}</h2><p class="sub">${esc(text||"No detailed pruning guidance is available yet.")}</p><div class="good-know compact-note" style="margin-top:14px"><div class="eyebrow">FloraLens rule</div><p class="sub" style="margin:0">This answer uses the stored practical-care guidance, current month and recorded flowering window. It does not infer pruning instructions from TRY ecological traits.</p></div><button class="btn primary" style="width:100%;margin-top:14px" onclick="closeModal()">Close</button>`);
}

function toggleGlance(tile){
  const open=tile.getAttribute("aria-expanded")!=="true";
  tile.setAttribute("aria-expanded",String(open));
  const more=tile.querySelector(".glance-more");
  if(more) more.textContent=open?"Less":"More";
}
function markClampedGlance(scope=document){
  scope.querySelectorAll(".glance-tile").forEach(tile=>{
    const b=tile.querySelector("b");
    tile.classList.toggle("clamped",!!b && b.scrollHeight>b.clientHeight+1);
  });
}

async function renderProfile(id,isNew=false){
  currentRoute="profile";
  const gardenPlant=state.plants.find(x=>x.id===id);
  const discovery=state.discoveries.find(x=>x.id===id);
  const p=gardenPlant||discovery;
  const isDiscovery=!!discovery&&!gardenPlant;
  if(!p) return setRoute("home");
  await preloadTryV7(p.scientific,p.speciesKey);
  const cached=state.speciesCache[p.speciesKey]||{};
  const intel=cached.enrichment||null;
  const hasBotanicalIntel=!!(intel||cached.tryV7);
  const t=intel?.trefle||null;
  const pn=intel?.perenual||null;
  const g=intel?.gbif||null;
  const care=resolvedCare(p.scientific,t,pn,p.speciesKey);
  const sourceNames=[...(intel?.sources||[])];
  if(care.plantAtlas && !sourceNames.includes("Plant Atlas 2020")) sourceNames.push("Plant Atlas 2020");
  if(care.localSource && !sourceNames.includes(care.localSource)) sourceNames.push(care.localSource);
  if(care.usedTraits) sourceNames.push(`${care.traitDataset||"TRY traits"} · ${care.traitMatchLevel==="genus"?"genus context":"species"}`);
  const realDesc=chooseProfileDescription({pn,t,g,p});
  const gmDesc=realDesc?null:usable(geminiFieldsFor(p.scientific,p.speciesKey).description);
  const desc=realDesc||gmDesc;
  const gmCount=(care.geminiFilled?.length||0)+(gmDesc?1:0);
  if(gmCount) sourceNames.push(`✦ Google Gemini · ${gmCount} gap${gmCount===1?"":"s"} filled`);
  const uniqueSources=[...new Set(sourceNames)];
  const bloom=care.bloomMonths?.length?care.bloomMonths:(p.bloom||[]);
  const distributionRecord=buildDistributionRecord({g,p});
  const currentSeason=seasonKey();
  const seasonalLocal=care.seasonal?.[currentSeason]||null;
  const atlasSeasonal=plantAtlasSeasonText(care.plantAtlas);
  const seasonalText=atlasSeasonal||seasonalLocal||null;
  const seasonalTitle=atlasSeasonal?"Flowering season":seasonalLocal?"Seasonal care":null;
  const careAvailable=[care.light,care.water,care.soil,care.height,care.growthHabit,care.pruning,care.hardiness].filter(Boolean).length;
  const careCoverage=Math.round((careAvailable/7)*100);
  const botanicalRecordCoverage=botanicalCoverage(care);
  const confidence=p.score?`${Math.round(Number(p.score))}% match`:"Identified";
  const placeLabel=isDiscovery?(p.wishlist?"Wishlist":"Discover"):(p.area||"My Garden");
  const bloomStatus=profileBloomStatus(bloom);
  const backRoute=isDiscovery?"discover":"garden";
  const backLabel=isDiscovery?"Discover":"My Garden";
  const plantToday=plantTodayModel(p,care,isDiscovery);
  const pruningAssistant=buildPruningAssistant(care,p,bloom);

  const botanicalRows=(care.growthHabit||care.growthRate||care.traitGrowthFormDetailed||care.traitWoodiness||care.traitLifeHistory||care.traitLeafPhenology||care.traitFlowerColour||care.traitSoilPH||care.traitTolerances||care.traitLeafType||care.traitHabitat||care.traitVegetation||care.traitClimate||care.traitEllenberg||care.traitSubstrate||care.traitNutrientContext||care.traitSoilMoistureContext||t?.flowerColors?.length||t?.foliageColors?.length)?`<div class="dossier-facts">
      ${care.traitGrowthFormDetailed?`<div class="dossier-fact"><span>❧</span><div><small>Growth form</small><b>${esc(care.traitGrowthFormDetailed)}</b></div></div>`:care.growthHabit?`<div class="dossier-fact"><span>❧</span><div><small>Growth form</small><b>${esc(care.growthHabit)}</b></div></div>`:""}
      ${care.traitWoodiness?`<div class="dossier-fact"><span>♧</span><div><small>Woodiness</small><b>${esc(care.traitWoodiness)}</b></div></div>`:""}
      ${care.traitLifeHistory?`<div class="dossier-fact"><span>◌</span><div><small>Life history</small><b>${esc(care.traitLifeHistory)}</b></div></div>`:""}
      ${care.traitLeafPhenology?`<div class="dossier-fact"><span>❧</span><div><small>Leaf phenology</small><b>${esc(care.traitLeafPhenology)}</b></div></div>`:""}
      ${care.traitFlowerColour?`<div class="dossier-fact"><span>✿</span><div><small>Flower colour</small><b>${esc(care.traitFlowerColour)}</b></div></div>`:""}
      ${care.height?`<div class="dossier-fact"><span>↕</span><div><small>Height / size</small><b>${esc(care.height)}</b></div></div>`:""}
      ${care.traitHabitat?`<div class="dossier-fact"><span>⌂</span><div><small>Habitat</small><b>${esc(care.traitHabitat)}</b></div></div>`:""}
      ${care.traitVegetation?`<div class="dossier-fact"><span>❦</span><div><small>Vegetation</small><b>${esc(care.traitVegetation)}</b></div></div>`:""}
      ${care.traitClimate?`<div class="dossier-fact"><span>◌</span><div><small>Climate context</small><b>${esc(care.traitClimate)}</b></div></div>`:""}
      ${care.traitSoilPH?`<div class="dossier-fact"><span>◇</span><div><small>Recorded soil pH</small><b>${esc(care.traitSoilPH.min??"?")}–${esc(care.traitSoilPH.max??"?")}</b></div></div>`:""}
      ${care.traitTolerances?`<div class="dossier-fact"><span>⌁</span><div><small>Tolerances</small><b>${esc(care.traitTolerances)}</b></div></div>`:""}
      ${care.traitSubstrate?`<div class="dossier-fact"><span>◇</span><div><small>Substrate</small><b>${esc(care.traitSubstrate)}</b></div></div>`:""}
      ${care.traitNutrientContext?`<div class="dossier-fact"><span>♧</span><div><small>Nutrient context</small><b>${esc(care.traitNutrientContext)}</b></div></div>`:""}
      ${care.traitSoilMoistureContext?`<div class="dossier-fact"><span>💧</span><div><small>Soil-moisture context</small><b>${esc(care.traitSoilMoistureContext)}</b></div></div>`:""}
      ${care.traitEllenberg?`<div class="dossier-fact dossier-fact-wide"><span>⌁</span><div><small>Ellenberg ecological indicators</small><b>${esc(care.traitEllenberg)}</b><em>Ecological context, not direct care instructions.</em></div></div>`:""}
      ${care.growthRate?`<div class="dossier-fact"><span>↗</span><div><small>Growth rate</small><b>${esc(care.growthRate)}</b></div></div>`:""}
      ${care.traitLeafType?`<div class="dossier-fact"><span>❧</span><div><small>Leaf type</small><b>${esc(care.traitLeafType)}</b></div></div>`:""}
      ${t?.foliageColors?.length?`<div class="dossier-fact"><span>❧</span><div><small>Foliage</small><b>${esc(t.foliageColors.join(", "))}</b></div></div>`:""}
    </div>`:`<div class="profile-empty"><span>❧</span><b>Botanical record still growing</b><p>FloraLens has not yet found additional species traits for this plant.</p></div>`;

  const storyHtml=isDiscovery?`
      <div class="history-lead"><span>⌾</span><div><small>Discovery record</small><b>A saved moment worth remembering</b><p>Identification, botanical enrichment and future garden decisions stay together here.</p></div></div>
      <div class="profile-card plant-life-timeline">
        <div class="timeline-item"><div class="timeline-icon">⌾</div><div><b>Spotted by FloraLens</b><div class="small">${p.spotted?new Date(p.spotted).toLocaleDateString("en-GB"):"Saved discovery"}</div></div></div>
        <div class="timeline-item"><div class="timeline-icon">📷</div><div><b>Identification photo saved</b><div class="small">${p.score?`${p.score}% identification match`:"Original identification photo stored on this device."}</div></div></div>
        ${intel?`<div class="timeline-item"><div class="timeline-icon">❧</div><div><b>Botanical record enriched</b><div class="small">${intel.fetchedAt?new Date(intel.fetchedAt).toLocaleDateString("en-GB"):"Cached"} · ${uniqueSources.map(esc).join(" + ")||"connected sources"}</div></div></div>`:""}
      </div>`:`
      <div class="history-lead"><span>✿</span><div><small>Living record</small><b>${esc(p.common)} in your garden</b><p>Care, observations and seasonal changes build into one continuous plant story.</p></div></div>
      <div class="profile-location-card"><div><div class="eyebrow">Lives in</div><h3>${esc(p.area||"Unplaced")}</h3></div><button class="link-btn" onclick="movePlantPrompt('${p.id}')">Move area</button></div>
      <div class="history-actions"><button class="mini-action" onclick="openCareComposer('${p.id}')">＋ Care record</button><button class="mini-action" onclick="addJournalForPlant('${p.id}')">＋ Garden moment</button></div>
      <div class="profile-card plant-life-timeline"><div class="timeline-item"><div class="timeline-icon">✿</div><div><b>Added to FloraLens</b><div class="small">${esc(p.added||"")}</div></div></div>${[...state.journal].filter(j=>j.plantId===p.id).sort((x,y)=>String(y.date||"").localeCompare(String(x.date||""))).map(j=>`<div class="timeline-item story-moment"><div class="timeline-icon">${journalTypeIcon(j.type)}</div><div class="story-moment-copy"><b>${esc(j.type||"Garden moment")}</b><div class="small">${formatJournalDate(j.date)}</div>${j.text?`<div class="story-note">${esc(j.text)}</div>`:""}${j.photoKey?`<div class="story-thumb" data-photo-key="${esc(j.photoKey)}"></div>`:""}</div></div>`).join("")}<div class="timeline-item"><div class="timeline-icon">📷</div><div><b>Plant profile created</b><div class="small">Its original identification photo is stored on this device.</div></div></div>${intel?`<div class="timeline-item"><div class="timeline-icon">❧</div><div><b>Botanical record enriched</b><div class="small">${intel.fetchedAt?new Date(intel.fetchedAt).toLocaleDateString("en-GB"):"Cached"} · ${uniqueSources.map(esc).join(" + ")||"connected sources"}</div></div></div>`:""}</div>`;

  view.innerHTML=`<section class="page-head profile-back"><button class="link-btn" onclick="setRoute('${backRoute}')">← ${backLabel}</button></section>
    <div class="profile-dossier-hero" id="profileHero">
      <div class="plant-art ${p.art||""}"></div><div class="profile-dossier-shade"></div>${p.stockPhoto?`<span class="hero-credit">Reference photo${p.photoCredit?` · ${esc(p.photoCredit)}`:""}</span>`:""}
      <div class="profile-dossier-top"><span class="profile-family">${esc(p.family||"Botanical profile")}</span><span class="profile-season-badge">${esc(bloomStatus)}</span></div>
      <div class="profile-dossier-copy"><h1>${esc(p.common)}</h1><em>${esc(p.scientific)}</em><div class="profile-meta-row"><span>◎ ${esc(confidence)}</span><span>⌂ ${esc(placeLabel)}</span></div></div>
    </div>

    ${isDiscovery?renderBuyCheck(p):""}
    <nav class="profile-tabs" aria-label="Plant profile sections">
      <button class="profile-tab active" data-profile-tab="care" onclick="setProfileTab('care')"><span>☀</span>Care</button>
      <button class="profile-tab" data-profile-tab="botany" onclick="setProfileTab('botany')"><span>❧</span>Botany</button>
      <button class="profile-tab" data-profile-tab="history" onclick="setProfileTab('history')"><span>◷</span>History</button>
    </nav>

    <section class="profile-panel active" data-profile-panel="care">
      <div class="profile-section-intro"><div><div class="eyebrow">Practical care</div><h2>How to look after ${esc(p.common)}</h2></div><div class="profile-completeness care"><span>❧</span><div><b>${careCoverage}%</b><small>care guide</small></div></div></div>
      ${renderPlantTodayCard(plantToday,p)}
      ${renderPruningAssistant(pruningAssistant,p)}
      ${(care.light||care.water||care.soil||care.hardiness)?`<div class="care-glance"><div class="care-glance-head"><div><span>At a glance</span><b>The essentials</b></div><em>${careAvailable}/7 care fields</em></div><div class="care-glance-grid">${care.light?`<div class="glance-tile" data-ico="sun"><span>☀</span><small>Light</small><b>${esc(care.light)}</b></div>`:""}${care.water?`<div class="glance-tile" data-ico="drop"><span>💧</span><small>Water</small><b>${esc(care.water)}</b></div>`:""}${care.soil?`<div class="glance-tile" data-ico="soil"><span>♧</span><small>Soil</small><b>${esc(care.soil)}</b></div>`:""}${care.hardiness?`<div class="glance-tile" data-ico="snow"><span>❄</span><small>Hardiness</small><b>${esc(care.hardiness)}</b></div>`:""}</div></div>`:""}
      <div class="profile-summary-card"><p>${esc(desc||"The species is identified, but the connected botanical records do not currently include a fuller description.")}</p></div>
      ${seasonalText?`<div class="season-card premium-season"><div class="eyebrow">Right now · ${atlasSeasonal?"Plant Atlas 2020":"FloraLens care"}</div><h2>${esc(seasonalTitle)}</h2><p class="sub" style="margin:0">${esc(seasonalText)}</p></div>`:""}
      <div class="care-grid dossier-care-grid">
        ${care.height?`<div class="care-tile care-wide"><span class="care-icon">↕</span><b>Size</b><small>${esc(care.height)}</small></div>`:""}
        ${care.pruning?`<div class="care-tile care-wide"><span class="care-icon">✂</span><b>Pruning</b><small>${esc(care.pruning)}</small></div>`:""}
        ${care.propagation?`<div class="care-tile care-wide"><span class="care-icon">🌱</span><b>Propagation</b><small>${esc(care.propagation)}</small></div>`:""}
      </div>
      <div class="profile-card flowering-card"><div class="profile-card-head"><div><div class="eyebrow">Flowering</div><h2>Flowering year</h2></div><span>${esc(bloomStatus)}</span></div><div class="months">${["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=>`<div class="month ${bloom.includes(i+1)?"on":""}">${m}</div>`).join("")}</div>${!bloom.length?`<p class="small data-missing">Flowering months are not yet available for this plant.</p>`:""}</div>
      ${care.safety?`<div class="good-know"><div class="eyebrow">Good to know</div><h2>Safety</h2><p class="sub" style="margin:0">${esc(care.safety)}</p></div>`:""}
      ${isDiscovery?`<div class="profile-card discovery-profile-actions"><div class="eyebrow">Saved inspiration</div><h2>${p.wishlist?"On your wishlist":"Spotted in Discover"}</h2><p class="sub">Keep it for reference or bring it into My Garden when it comes home with you.</p><div class="actions"><button class="btn primary" onclick="addDiscoveryToGarden('${p.id}')">＋ Add to Garden</button><button class="btn secondary" onclick="toggleWishlistFromProfile('${p.id}')">${p.wishlist?"♥ Remove wishlist":"♡ Add to wishlist"}</button></div></div>`:""}
      <div class="profile-dock-reserve" aria-hidden="true"></div>
    </section>

    <section class="profile-panel" data-profile-panel="botany">
      <div class="profile-section-intro"><div><div class="eyebrow">Botanical dossier</div><h2>What FloraLens knows</h2></div><div class="profile-completeness botanical"><span>⌘</span><div><b>${botanicalRecordCoverage}%</b><small>species record</small></div></div></div>
      <div class="botany-identity"><div class="botany-seal">❧</div><div><small>Botanical record</small><h3>${esc(p.scientific)}</h3><p>${care.traitDataset?`${esc(care.traitDataset)} · ${care.traitMatchLevel==="genus"?"genus context":"species-level match"}`:"Curated botanical context"}${care.plantAtlas?" · Plant Atlas phenology":""}</p></div></div>
      <div class="record-meter knowledge-meter"><div class="knowledge-row"><span><i>☀</i><b>Practical care</b><small>Growing guidance</small></span><strong>${careCoverage}%</strong></div><div class="coverage"><span style="width:${careCoverage}%"></span></div><div class="knowledge-row"><span><i>❧</i><b>Botanical record</b><small>Traits & ecological context</small></span><strong>${botanicalRecordCoverage}%</strong></div><div class="coverage botanical-coverage"><span style="width:${botanicalRecordCoverage}%"></span></div></div>
      ${renderDistributionCard(distributionRecord)}
      ${botanicalRows}
      <div class="source-dossier"><div class="eyebrow">Provenance</div><h3>Where this record comes from</h3><div class="source-row">${uniqueSources.map(s=>`<span class="source-pill">${esc(s)}</span>`).join("")}${care.localMatchLevel?`<span class="source-pill">Care match: ${esc(care.localMatchLevel)}</span>`:""}</div><div class="action-row"><button class="mini-action" onclick="refreshIntel('${p.id}')">↻ Refresh record</button><button class="mini-action" onclick="exportBackup()">⇩ Backup garden</button></div></div>
      ${gmCount?`<div class="good-know compact-note gm-note"><div class="eyebrow">✦ Filled in by Gemini</div><p class="sub">None of FloraLens' botanical sources had ${esc(geminiFieldList(care,gmDesc))} for this plant, so Google Gemini filled ${gmCount===1?"it":"them"} in. Real source data replaces Gemini's automatically when it becomes available.</p></div>`:""}
      ${care.usedLocal?`<div class="good-know compact-note"><div class="eyebrow">Care-source note</div><p class="sub">FloraLens prefers species-level practical guidance and uses curated genus guidance only as a cautious fallback.</p></div>`:""}
      ${care.usedTraits?`<div class="good-know compact-note"><div class="eyebrow">TRY v7</div><p class="sub">TRY traits are botanical and ecological context rather than direct growing instructions.${care.traitMatchLevel==="genus"?" This record uses clearly labelled genus-level context because a safe exact species match was not available.":""}</p></div>`:""}
      <div class="profile-dock-reserve" aria-hidden="true"></div>
    </section>

    <section class="profile-panel" data-profile-panel="history">
      <div class="profile-section-intro"><div><div class="eyebrow">Plant history</div><h2>${isDiscovery?"Discovery story":"Your story together"}</h2></div><div class="profile-completeness history"><span>◷</span><div><b>${isDiscovery?"Saved":state.journal.filter(j=>j.plantId===p.id).length}</b><small>${isDiscovery?"discovery":"garden moments"}</small></div></div></div>
      ${storyHtml}
      ${isDiscovery?`<button class="link-btn discovery-delete-link history-delete" onclick="confirmDeleteDiscovery('${p.id}')">Remove from Discover</button>`:""}
      <div class="profile-dock-reserve" aria-hidden="true"></div>
    </section>`;

  if(!p.photoKey&&p.photoUrl){
    const hero=document.getElementById("profileHero"); hero?.querySelector(".plant-art")?.remove();
    hero?.insertAdjacentHTML("afterbegin",`<img class="photo-hero" src="${esc(p.photoUrl)}" alt="${esc(p.common)}">`);
  }
  if(p.photoKey){
    const url=await getPhotoUrl(p.photoKey);
    if(url){ const hero=document.getElementById("profileHero"); hero?.querySelector(".plant-art")?.remove(); hero?.insertAdjacentHTML("afterbegin",`<img class="photo-hero" src="${url}" alt="${esc(p.common)}">`); }
  }
  hydratePhotos();
  hydrateDistributionMaps();
  requestAnimationFrame(()=>markClampedGlance());
  view.dataset.profileId=p.id; view.setAttribute("data-profile-id",p.id);
  maybeFillGaps(p);
}

async function exportBackup(){
  try{
    const photos={};
    for(const p of [...state.plants,...state.discoveries,...state.journal]){
      if(!p.photoKey) continue;
      const db=await photoDB();
      const blob=await new Promise((resolve,reject)=>{
        const tx=db.transaction(PHOTO_STORE,"readonly");
        const req=tx.objectStore(PHOTO_STORE).get(p.photoKey);
        req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
      });
      if(blob) photos[p.photoKey]=await blobToDataUrl(blob);
    }
    const payload={format:"FloraLens Backup",version:3,exportedAt:new Date().toISOString(),state,photos};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`FloraLens-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    toast("Garden backup created");
  }catch(err){ console.error(err); toast("Backup couldn’t be created"); }
}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});}

function confirmDeletePlant(id){
  const p=state.plants.find(x=>x.id===id);
  if(!p) return;
  modal(`<div class="eyebrow">Remove from your garden</div><h2>Delete ${esc(p.common)}?</h2><p class="sub">This removes the plant entry and its saved identification photo from this device. The shared species knowledge stays cached for future identifications.</p><div class="actions"><button class="btn secondary" onclick="closeModal()">Keep it</button><button class="btn danger" onclick="deletePlant('${p.id}')">Delete plant</button></div>`);
}
async function deletePlant(id){
  const p=state.plants.find(x=>x.id===id);
  if(!p) return;
  state.plants=state.plants.filter(x=>x.id!==id);
  saveState();
  closeModal();
  await deletePhoto(p.photoKey);
  toast(`${p.common} removed`);
  if(currentRoute==="garden") renderGarden(); else renderHome();
}

function journalTypeIcon(type){
  return ({"Flowering":"✿","New growth":"❧","Pruned":"✂","Moved":"⌂","Problem":"!","Repotted":"◌","Planted":"♧","Harvest":"◇","Note":"✎"})[type]||"✎";
}
function formatJournalDate(v){
  if(!v)return "";
  const d=new Date(`${v}T12:00:00`);
  return d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
}
function renderJournal(){
  const entries=[...state.journal].sort((x,y)=>String(y.date||"").localeCompare(String(x.date||"")));
  const plantCount=new Set(entries.map(j=>j.plantId)).size;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Garden memories</div><h1>Journal</h1><p class="sub">A living record of what changed, flowered, moved and surprised you.</p></section>
  <button class="journal-hero-button" onclick="openJournalComposer()"><span class="journal-hero-mark">✎</span><span><strong>Add a garden moment</strong><small>Photo, note, care job or milestone</small></span><b>＋</b></button>
  <div class="stats-strip"><div class="stat"><b>${entries.length}</b><small>moments</small></div><div class="stat"><b>${plantCount}</b><small>plants</small></div><div class="stat"><b>${entries.filter(j=>j.photoKey).length}</b><small>photos</small></div></div>
  ${entries.length?`<div class="journal-feed">${entries.map(j=>{
    const p=state.plants.find(x=>x.id===j.plantId); if(!p)return "";
    return `<article class="journal-entry" onclick="if(!event.target.closest('button')) setRoute('profile',{id:'${p.id}'})">
      ${j.photoKey?`<div class="journal-photo" data-photo-key="${esc(j.photoKey)}"></div>`:""}
      <div class="journal-entry-body"><div class="journal-date">${formatJournalDate(j.date)}</div>
      <div class="journal-entry-head"><span class="journal-type">${journalTypeIcon(j.type)} ${esc(j.type||"Note")}</span><button class="journal-delete" onclick="event.stopPropagation();confirmDeleteJournal('${j.id}')">×</button></div>
      <h2>${esc(p.common)}</h2><em>${esc(p.scientific)}</em>${j.text?`<p>${esc(j.text)}</p>`:""}<div class="journal-link">View ${esc(p.common)} →</div></div>
    </article>`}).join("")}</div>`:`<div class="empty-card journal-empty"><div class="pressed-flower">❀</div><h2>Your garden story starts here</h2><p class="sub">Capture first flowers, new growth, pruning, moves, problems or simply a moment you loved.</p><button class="btn primary" onclick="openJournalComposer()">Add first moment</button></div>`}`;
  hydratePhotos();
}
function addJournalForPlant(id){openJournalComposer(id)}
function openJournalComposer(plantId=null){
  if(!state.plants.length){modal(`<div class="eyebrow">Garden journal</div><h2>Add a plant first</h2><p class="sub">Journal moments belong to plants in My Garden.</p><button class="btn primary" style="width:100%" onclick="closeModal();startCamera('identify')">Identify a plant</button>`);return}
  pendingJournalPlantId=plantId||state.plants[0].id; pendingJournalPhotoFile=null; renderJournalComposer();
}
function renderJournalComposer(){
  const p=state.plants.find(x=>x.id===pendingJournalPlantId)||state.plants[0]; if(!p)return;
  pendingJournalPlantId=p.id;
  const types=["Flowering","New growth","Pruned","Moved","Problem","Repotted","Planted","Harvest","Note"];
  modal(`<div class="journal-composer"><div class="eyebrow">Garden moment</div><h2>Add to the story</h2>
  <label class="field-label">Plant</label><select id="journalPlant" class="journal-field" onchange="pendingJournalPlantId=this.value">${state.plants.map(x=>`<option value="${x.id}" ${x.id===p.id?"selected":""}>${esc(x.common)} · ${esc(x.area||"Unplaced")}</option>`).join("")}</select>
  <label class="field-label">What happened?</label><div class="journal-type-grid">${types.map((t,i)=>`<button type="button" class="journal-type-choice ${i===0?"active":""}" data-journal-type="${esc(t)}" onclick="selectJournalType(this)">${journalTypeIcon(t)}<span>${esc(t)}</span></button>`).join("")}</div><input type="hidden" id="journalType" value="Flowering">
  <div class="journal-two-col"><div><label class="field-label">Date</label><input id="journalDate" class="journal-field" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div><label class="field-label">Photo</label><button class="journal-photo-button" type="button" onclick="journalPhotoInput.click()">📷 <span id="journalPhotoLabel">Add photo</span></button></div></div>
  <label class="field-label">A little note</label><textarea id="journalText" class="journal-field journal-textarea" maxlength="500" placeholder="What changed? What did you notice?"></textarea>
  <button class="btn primary" style="width:100%;margin-top:14px" onclick="saveJournalMoment()">Save moment</button></div>`);
}
function selectJournalType(btn){
  document.querySelectorAll(".journal-type-choice").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.getElementById("journalType").value=btn.dataset.journalType;
}
journalPhotoInput.addEventListener("change",()=>{
  const f=journalPhotoInput.files?.[0];if(!f)return;pendingJournalPhotoFile=f;
  const el=document.getElementById("journalPhotoLabel");if(el)el.textContent="Photo ready ✓";journalPhotoInput.value="";
});
async function saveJournalMoment(){
  const plantId=document.getElementById("journalPlant")?.value||pendingJournalPlantId;
  const p=state.plants.find(x=>x.id===plantId);if(!p)return;
  const id="journal-"+Date.now(), photoKey=pendingJournalPhotoFile?`${id}-photo`:null;
  if(photoKey){try{await savePhoto(photoKey,pendingJournalPhotoFile)}catch(e){console.warn(e)}}
  state.journal.unshift({id,plantId,date:document.getElementById("journalDate")?.value||new Date().toISOString().slice(0,10),type:document.getElementById("journalType")?.value||"Note",text:(document.getElementById("journalText")?.value||"").trim(),photoKey,createdAt:new Date().toISOString()});
  saveState();pendingJournalPhotoFile=null;pendingJournalPlantId=null;closeModal();toast(`Moment added to ${p.common}`);setRoute("journal");
}
function confirmDeleteJournal(id){
  const j=state.journal.find(x=>x.id===id);if(!j)return;
  modal(`<div class="eyebrow">Journal</div><h2>Remove this moment?</h2><p class="sub">The note${j.photoKey?" and photo":""} will be removed from this device.</p><div class="actions"><button class="btn secondary" onclick="closeModal()">Keep it</button><button class="btn danger" onclick="deleteJournalMoment('${id}')">Delete</button></div>`);
}
async function deleteJournalMoment(id){
  const j=state.journal.find(x=>x.id===id);if(!j)return;state.journal=state.journal.filter(x=>x.id!==id);saveState();closeModal();if(j.photoKey)await deletePhoto(j.photoKey);toast("Journal moment removed");renderJournal();
}


function localISODate(d=new Date()){
  const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return x.toISOString().slice(0,10);
}
function careSeason(month=new Date().getMonth()+1){
  if([3,4,5].includes(month))return "spring";
  if([6,7,8].includes(month))return "summer";
  if([9,10,11].includes(month))return "autumn";
  return "winter";
}
function careDateLabel(date){
  const today=localISODate();
  const tomorrow=localISODate(new Date(Date.now()+86400000));
  if(date===today)return "Today";
  if(date===tomorrow)return "Tomorrow";
  const d=new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
}
function daysFromToday(date){
  const a=new Date(`${localISODate()}T12:00:00`);
  const b=new Date(`${date}T12:00:00`);
  return Math.round((b-a)/86400000);
}
function careTaskIcon(type){
  return ({"Water":"◌","Prune":"✂","Feed":"◇","Check":"⌕","Repot":"♧","Protect":"⌂","Plant":"❧","Other":"✎"})[type]||"✎";
}
function careForPlant(p){
  const intel=state.speciesCache[p.speciesKey]?.enrichment||null;
  return resolvedCare(p.scientific,intel?.trefle||null,intel?.perenual||null,p.speciesKey);
}
function smartCareSuggestions(){
  const season=careSeason(), month=new Date().getMonth()+1;
  const out=[];
  for(const p of state.plants){
    const c=careForPlant(p);
    const seasonal=c?.seasonal?.[season];
    if(seasonal) out.push({key:`season-${p.id}-${season}`,plantId:p.id,type:"Check",title:`Seasonal check: ${p.common}`,detail:seasonal});
    const water=String(c?.water||p.water||"").toLowerCase();
    const rainedOn=isOutdoorPlant(p)&&wxRainedRecently();
    if(!rainedOn && ((p.area||"").toLowerCase().includes("indoor") || /keep.*moist|regular|evenly moist|consistent moisture/.test(water))){
      out.push({key:`water-${p.id}-${month}`,plantId:p.id,type:"Water",title:`Check ${p.common}'s moisture`,detail:c?.water||p.water||"Check the compost/soil before watering rather than watering automatically."});
    }
    if(c?.bloomMonths?.includes(month) && /deadhead|spent|flower/.test(String(c?.pruning||"").toLowerCase())){
      out.push({key:`bloom-${p.id}-${month}`,plantId:p.id,type:"Prune",title:`Flowering care for ${p.common}`,detail:c.pruning});
    }
  }
  const frost=weatherAlerts().find(x=>x.type==="frost");
  if(frost) frost.plants.forEach(id=>{ const p=state.plants.find(x=>x.id===id); if(p) out.unshift({key:`frost-${id}-${frost.date}`,plantId:id,type:"Protect",title:`Protect ${p.common} from frost`,detail:`${frost.title}. Fleece it, or move it somewhere sheltered.`}); });
  return out.slice(0,12);
}
function activeCareTasks(){
  return [...state.careTasks].filter(t=>!t.completed).sort((x,y)=>String(x.due).localeCompare(String(y.due)));
}
function careHomeCard(){
  const tasks=activeCareTasks();
  const today=localISODate();
  const due=tasks.filter(t=>t.due<=today).length;
  const suggestions=smartCareSuggestions();
  const headline=due?`${due} ${due===1?"job":"jobs"} need attention`:tasks.length?`${tasks.length} care jobs coming up`:`${suggestions.length} seasonal suggestions`;
  const sub=due?"A little garden care is waiting for you.":tasks.length?"Your next jobs are already organised.":"FloraLens has looked across your garden for useful seasonal care.";
  return `<button class="care-home-card" onclick="setRoute('care')"><span class="care-home-icon">❧</span><span><small>Care calendar</small><strong>${headline}</strong><em>${sub}</em></span><b>→</b></button>`;
}
function renderCareCalendar(){
  const tasks=activeCareTasks();
  const completed=state.careTasks.filter(t=>t.completed).sort((x,y)=>String(y.completedAt||"").localeCompare(String(x.completedAt||""))).slice(0,8);
  const suggestions=smartCareSuggestions().filter(s=>!state.careTasks.some(t=>t.suggestionKey===s.key));
  const today=localISODate();
  const dueNow=tasks.filter(t=>t.due<=today);
  const upcoming=tasks.filter(t=>t.due>today);
  view.innerHTML=`<section class="page-head"><div class="eyebrow">A gentler to-do list</div><h1>Care Calendar</h1><p class="sub">Keep the garden thriving without turning it into a spreadsheet.</p></section>
    <button class="care-add" onclick="openCareComposer()"><span>＋</span><div><b>Add a care job</b><small>Water, prune, feed, repot or anything else</small></div></button>
    <div class="care-season-card"><div><div class="eyebrow">Right now · ${careSeason()}</div><h2>${new Date().toLocaleDateString("en-GB",{month:"long"})} in your garden</h2><p>${suggestions.length?`FloraLens found ${suggestions.length} useful care ${suggestions.length===1?"suggestion":"suggestions"} from your saved plant guidance.`:"Your suggested seasonal jobs are already covered."}</p></div><span>❀</span></div>
    ${dueNow.length?`<div class="section-title"><h3>Needs attention</h3><span class="care-count">${dueNow.length}</span></div><div class="care-list">${dueNow.map(careTaskCard).join("")}</div>`:""}
    ${upcoming.length?`<div class="section-title"><h3>Coming up</h3></div><div class="care-list">${upcoming.map(careTaskCard).join("")}</div>`:""}
    <div class="section-title"><h3>Suggested for your plants</h3></div>
    ${suggestions.length?`<div class="care-suggestions">${suggestions.map(careSuggestionCard).join("")}</div>`:`<div class="empty-card care-clear"><span>✓</span><h2>Looking beautifully organised</h2><p class="sub">No new seasonal suggestions at the moment.</p></div>`}
    ${completed.length?`<div class="section-title"><h3>Recently done</h3></div><div class="care-completed">${completed.map(t=>{const p=state.plants.find(x=>x.id===t.plantId);return `<div><span>✓</span><p><b>${esc(t.title)}</b><small>${p?esc(p.common)+" · ":""}${t.completedAt?new Date(t.completedAt).toLocaleDateString("en-GB"):"Done"}</small></p></div>`}).join("")}</div>`:""}`;
}
function careTaskCard(t){
  const p=state.plants.find(x=>x.id===t.plantId);
  const overdue=daysFromToday(t.due)<0;
  return `<article class="care-task ${overdue?"overdue":""}">
    <button class="care-check" onclick="completeCareTask('${t.id}')">✓</button>
    <div class="care-task-copy"><div class="care-task-top"><span>${careTaskIcon(t.type)} ${esc(t.type||"Care")}</span><small>${overdue?"Overdue · ":""}${careDateLabel(t.due)}</small></div><h2>${esc(t.title)}</h2>${p?`<button class="care-plant-link" onclick="setRoute('profile',{id:'${p.id}'})">${esc(p.common)} · ${esc(p.area||"Unplaced")}</button>`:""}${t.notes?`<p>${esc(t.notes)}</p>`:""}</div>
    <button class="care-more" onclick="careTaskMenu('${t.id}')">•••</button>
  </article>`;
}
function careSuggestionCard(s){
  const p=state.plants.find(x=>x.id===s.plantId);
  return `<article class="care-suggestion"><div class="care-suggest-icon">${careTaskIcon(s.type)}</div><div><div class="eyebrow">${p?esc(p.area||"Garden"):"Garden"} · suggested</div><h2>${esc(s.title)}</h2><p>${esc(s.detail)}</p><button class="mini-action" onclick="addSuggestedCare('${encodeURIComponent(s.key)}')">＋ Add to calendar</button></div></article>`;
}
function openCareComposer(plantId=null){
  if(!state.plants.length){modal(`<div class="eyebrow">Care Calendar</div><h2>Add a plant first</h2><p class="sub">Care jobs can be linked to plants in My Garden.</p><button class="btn primary" style="width:100%" onclick="closeModal();startCamera('identify')">Identify a plant</button>`);return}
  const selected=state.plants.find(p=>p.id===plantId)||state.plants[0];
  const inSeven=new Date(Date.now()+7*86400000);
  modal(`<div class="eyebrow">Care Calendar</div><h2>Add a care job</h2>
    <label class="field-label">Plant</label><select id="carePlant" class="journal-field">${state.plants.map(p=>`<option value="${p.id}" ${p.id===selected.id?"selected":""}>${esc(p.common)} · ${esc(p.area||"Unplaced")}</option>`).join("")}</select>
    <label class="field-label">Job</label><input id="careTitle" class="journal-field" placeholder="e.g. Prune after flowering">
    <div class="journal-two-col"><div><label class="field-label">Type</label><select id="careType" class="journal-field">${["Check","Water","Prune","Feed","Repot","Protect","Plant","Other"].map(x=>`<option>${x}</option>`).join("")}</select></div><div><label class="field-label">Due</label><input id="careDue" class="journal-field" type="date" value="${localISODate(inSeven)}"></div></div>
    <label class="field-label">Note</label><textarea id="careNotes" class="journal-field journal-textarea" maxlength="400" placeholder="Optional detail"></textarea>
    <button class="btn primary" style="width:100%;margin-top:14px" onclick="saveCareTask()">Add to calendar</button>`);
}
function saveCareTask(){
  const plantId=document.getElementById("carePlant")?.value;
  const title=(document.getElementById("careTitle")?.value||"").trim();
  if(!title){toast("Give the care job a name");return}
  state.careTasks.push({id:"care-"+Date.now(),plantId,title,type:document.getElementById("careType")?.value||"Other",due:document.getElementById("careDue")?.value||localISODate(),notes:(document.getElementById("careNotes")?.value||"").trim(),completed:false,createdAt:new Date().toISOString()});
  saveState();closeModal();toast("Care job added");renderCareCalendar();
}
function addSuggestedCare(encodedKey){
  const key=decodeURIComponent(encodedKey);
  const s=smartCareSuggestions().find(x=>x.key===key);if(!s)return;
  const due=new Date(Date.now()+2*86400000);
  state.careTasks.push({id:"care-"+Date.now(),plantId:s.plantId,title:s.title,type:s.type,due:localISODate(due),notes:s.detail,completed:false,createdAt:new Date().toISOString(),suggestionKey:s.key});
  saveState();toast("Added to Care Calendar");renderCareCalendar();
}
function completeCareTask(id){
  const t=state.careTasks.find(x=>x.id===id);if(!t)return;
  t.completed=true;t.completedAt=new Date().toISOString();saveState();toast("Lovely — job done");renderCareCalendar();
}
function careTaskMenu(id){
  const t=state.careTasks.find(x=>x.id===id);if(!t)return;
  modal(`<div class="eyebrow">Care job</div><h2>${esc(t.title)}</h2><button class="destination-choice" onclick="snoozeCareTask('${id}',7)"><span>↻</span><div><b>Move one week</b><small>Reschedule this job seven days later.</small></div></button><button class="destination-choice" onclick="editCareTask('${id}')"><span>✎</span><div><b>Edit job</b><small>Change its title, date or note.</small></div></button><button class="link-btn discovery-delete-link" style="width:100%" onclick="deleteCareTask('${id}')">Delete care job</button>`);
}
function snoozeCareTask(id,days){
  const t=state.careTasks.find(x=>x.id===id);if(!t)return;
  const d=new Date(`${t.due}T12:00:00`);d.setDate(d.getDate()+days);t.due=localISODate(d);saveState();closeModal();toast("Moved one week");renderCareCalendar();
}
function deleteCareTask(id){
  state.careTasks=state.careTasks.filter(x=>x.id!==id);saveState();closeModal();toast("Care job removed");renderCareCalendar();
}
function editCareTask(id){
  const t=state.careTasks.find(x=>x.id===id);if(!t)return;
  modal(`<div class="eyebrow">Care Calendar</div><h2>Edit care job</h2>
    <label class="field-label">Job</label><input id="editCareTitle" class="journal-field" value="${esc(t.title)}">
    <div class="journal-two-col"><div><label class="field-label">Type</label><select id="editCareType" class="journal-field">${["Check","Water","Prune","Feed","Repot","Protect","Plant","Other"].map(x=>`<option ${x===t.type?"selected":""}>${x}</option>`).join("")}</select></div><div><label class="field-label">Due</label><input id="editCareDue" class="journal-field" type="date" value="${esc(t.due)}"></div></div>
    <label class="field-label">Note</label><textarea id="editCareNotes" class="journal-field journal-textarea">${esc(t.notes||"")}</textarea>
    <button class="btn primary" style="width:100%;margin-top:14px" onclick="saveCareEdit('${id}')">Save changes</button>`);
}
function saveCareEdit(id){
  const t=state.careTasks.find(x=>x.id===id);if(!t)return;
  t.title=(document.getElementById("editCareTitle")?.value||t.title).trim();t.type=document.getElementById("editCareType")?.value||t.type;t.due=document.getElementById("editCareDue")?.value||t.due;t.notes=(document.getElementById("editCareNotes")?.value||"").trim();
  saveState();closeModal();toast("Care job updated");renderCareCalendar();
}
/* ===================== Look up a plant by name (Discover, via Gemini) ===================== */
let lastLookup=null;      // {query, result, photo, model}
let lookupBusy=false;
const LOOKUP_MONTHS=["J","F","M","A","M","J","J","A","S","O","N","D"];

let lookupFrom=null;
function lookupBack(){ if(lookupFrom==="planner"&&planResult){ lookupFrom=null; renderPlannerResult(); } else { lookupFrom=null; setRoute("discover"); } }
function lookupCard(){
  return `<form class="lookup-card" onsubmit="event.preventDefault();lookupFrom=null;lookupPlant(this.elements.q.value)">
    <div class="lookup-head"><span>⌕</span><div><b>Look up a plant</b><small>Type a name from a label, a magazine or a friend's tip</small></div></div>
    <div class="lookup-row"><input name="q" maxlength="120" autocomplete="off" autocapitalize="words" placeholder="e.g. Salvia Hot Lips"><button aria-label="Look up">→</button></div>
  </form>`;
}
async function lookupPlant(q){
  q=String(q||"").trim();
  if(!q||lookupBusy) return;
  if(!API_PROXY_URL){ toast("Plant lookup needs the FloraLens Worker"); return; }
  lookupBusy=true;
  currentRoute="discover";
  view.innerHTML=`<section class="page-head profile-back"><button class="link-btn" onclick="lookupBack()">← ${lookupFrom==="planner"?"Plant ideas":"Discover"}</button></section>
    <div class="lookup-loading"><div class="flower-loader">⌕</div><h2>Looking up “${esc(q)}”</h2><p class="sub">Gemini is finding the plant and its details.</p></div>`;
  appScrollTo(0);
  try{
    const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/lookup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})});
    const data=await res.json().catch(()=>null);
    if(!data) throw new Error(res.status===404?"The Worker doesn't have a /lookup route yet. Upload the new worker.js.":`Lookup failed (${res.status}).`);
    if(!res.ok||data.error){
      if(res.status===429||res.status===402){ noteGeminiPause(data); throw new Error(data.error||"Gemini's limit is reached for now. Try again later."); }
      throw new Error(data.error||`Lookup failed (${res.status}).`);
    }
    lastLookup={query:q,...data};
    clearGeminiPause();
    lookupBusy=false;
    renderLookupResult();
  }catch(err){
    lookupBusy=false;
    view.innerHTML=`<section class="page-head profile-back"><button class="link-btn" onclick="lookupBack()">← ${lookupFrom==="planner"?"Plant ideas":"Discover"}</button></section>
      <section class="ai-verdict ai-unclear"><div class="ai-verdict-top"><span class="ai-pill">Couldn't look it up</span></div><h2>Something went wrong</h2><p>${esc(friendlyNetError(err,"Plant lookup"))}</p></section>
      <div class="actions" style="margin-top:16px"><button class="btn primary" onclick="lookupPlant(decodeURIComponent('${jsArg(q)}'))">↻ Try again</button><button class="btn secondary" onclick="setRoute('discover')">Back</button></div>`;
  }
}
function lookupAltChips(alts){
  return (Array.isArray(alts)?alts:[]).filter(a=>a?.scientific).slice(0,3)
    .map(a=>`<button onclick="lookupPlant(decodeURIComponent('${jsArg(a.scientific)}'))"><b>${esc(a.common||a.scientific)}</b><small><i>${esc(a.scientific)}</i></small></button>`).join("");
}
function renderLookupResult(){
  const L=lastLookup; if(!L) return setRoute("discover");
  const r=L.result||{};
  const back=`<section class="page-head profile-back"><button class="link-btn" onclick="lookupBack()">← ${lookupFrom==="planner"?"Plant ideas":"Discover"}</button></section>`;
  if(!r.found||!r.scientific){
    view.innerHTML=`${back}<section class="ai-verdict ai-unclear"><div class="ai-verdict-top"><span class="ai-pill">Not found</span></div><h2>Couldn't place “${esc(L.query)}”</h2><p>Check the spelling, or try the name exactly as it's written on the label.</p></section>
      ${r.alternatives?.length?`<h3 class="lookup-sub">Did you mean</h3><div class="lookup-alts">${lookupAltChips(r.alternatives)}</div>`:""}
      ${lookupCard()}`;
    return;
  }
  const key=slug(r.scientific);
  const existing=state.discoveries.find(d=>d.speciesKey===key)||state.plants.find(p=>p.speciesKey===key);
  const months=(Array.isArray(r.bloomMonths)?r.bloomMonths:[]).map(Number);
  const tile=(ico,glyph,label,val)=>usable(val)?`<div class="glance-tile" data-ico="${ico}"><span>${glyph}</span><small>${label}</small><b>${esc(val)}</b></div>`:"";
  const wide=(glyph,label,val)=>usable(val)?`<div class="care-tile care-wide"><span class="care-icon">${glyph}</span><b>${label}</b><small>${esc(val)}</small></div>`:"";
  view.innerHTML=`${back}
    <div class="lookup-hero">
      ${L.photo?.url?`<img src="${esc(L.photo.url)}" data-fallback="${esc(L.photo.fallback||"")}" alt="${esc(r.common||r.scientific)}" onerror="lookupImgFallback(this)">`:`<div class="plant-art"></div>`}
      <div class="profile-dossier-shade"></div>
      <div class="profile-dossier-top"><span class="profile-family">${esc(r.family||"Plant")}</span>${L.photo?`<span class="photo-credit">Reference photo</span>`:""}</div>
      <div class="profile-dossier-copy"><h1>${esc(r.common||r.scientific)}</h1><em>${esc(r.scientific)}</em></div>
    </div>
    ${L.photo?`<p class="photo-credit-line">Photo: ${esc(L.photo.credit||L.photo.source)}</p>`:""}
    ${r.alternatives?.length?`<h3 class="lookup-sub">Not quite? Other matches</h3><div class="lookup-alts">${lookupAltChips(r.alternatives)}</div>`:""}
    <div class="lookup-actions">${existing
      ?`<button class="btn primary" onclick="setRoute('profile',{id:'${existing.id}'})">Open ${esc(existing.common)}</button>`
      :`<button class="btn primary" onclick="addLookupToWishlist()">♡ Add to wishlist</button>`}
      <button class="btn secondary" onclick="setRoute('discover')">Search again</button></div>
    ${r.description?`<div class="profile-summary-card"><p>${esc(r.description)}</p></div>`:""}
    ${Array.isArray(r.buying_tips)&&r.buying_tips.length?`<section class="buy-card buy-good lookup-buy"><div class="buy-head"><div><div class="eyebrow">At the garden centre</div><h2>Choosing a good one</h2></div><span class="buy-mark">✓</span></div><div class="buy-list pos">${r.buying_tips.slice(0,3).map(t=>`<div><span>✓</span><p>${esc(t)}</p></div>`).join("")}</div></section>`:""}
    <div class="care-glance"><div class="care-glance-head"><div><span>At a glance</span><b>The essentials</b></div></div>
      <div class="care-glance-grid">${tile("sun","☀","Light",r.light)}${tile("drop","💧","Water",r.water)}${tile("soil","♧","Soil",r.soil)}${tile("snow","❄","Hardiness",r.hardiness)}</div></div>
    ${months.length?`<div class="profile-card flowering-card"><div class="profile-card-head"><div><div class="eyebrow">Flowering</div><h2>Flowering year</h2></div></div><div class="months">${LOOKUP_MONTHS.map((m,i)=>`<div class="month ${months.includes(i+1)?"on":""}">${m}</div>`).join("")}</div></div>`:""}
    <div class="care-grid">${wide("↕","Size",r.height)}${wide("✂","Pruning",r.pruning)}${wide("🌱","Propagation",r.propagation)}</div>
    ${usable(r.safety)?`<div class="good-know"><div class="eyebrow">Good to know</div><h2>Safety</h2><p class="sub" style="margin:0">${esc(r.safety)}</p></div>`:""}
    <p class="ai-foot">Details from Google Gemini. When it's added, FloraLens also checks its usual botanical sources, and real data replaces Gemini's.</p>`;
  appScrollTo(0);
}
function lookupImgFallback(img){
  const f=img.dataset.fallback;
  if(f&&img.src!==f){ img.src=f; img.dataset.fallback=""; }
  else img.replaceWith(Object.assign(document.createElement("div"),{className:"plant-art"}));
}
// Download a reference photo onto the phone (via the Worker), so it also works offline.
async function storeReferencePhoto(photo,photoKey){
  for(const u of [photo?.url,photo?.fallback].filter(Boolean)){
    for(let attempt=0;attempt<2;attempt++){
      try{
        const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/image?url=${encodeURIComponent(u)}`);
        if(!res.ok){ console.warn("Reference photo",res.status,u); break; }
        const blob=await res.blob();
        if(!blob.size||!String(blob.type).startsWith("image/")) break;
        await savePhoto(photoKey,blob);
        return true;
      }catch(e){ console.warn("Reference photo",e); }
    }
  }
  return false;
}
// Looked-up plants saved without a photo (e.g. a dropped connection) get one later, automatically.
async function backfillReferencePhotos(){
  if(!API_PROXY_URL||!navigator.onLine) return 0;
  let done=0;
  const todo=[...state.discoveries,...state.plants].filter(x=>x.source==="lookup"&&!x.photoKey&&!x.photoTried).slice(0,6);
  for(const item of todo){
    try{
      const q=new URLSearchParams({name:item.scientific});
      if(item.species) q.set("species",item.species);
      const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/photo?${q}`);
      const data=await res.json().catch(()=>null);
      const key=`${item.id}-hero`;
      if(data?.photo&&await storeReferencePhoto(data.photo,key)){
        item.photoKey=key; item.stockPhoto=true; item.photoUrl=null; item.photoCredit=data.photo.credit||data.photo.source; done++;
      }else if(data?.photo){                            // found but couldn't store: show it online, retry storing later
        if(!item.photoUrl){ item.photoUrl=data.photo.url; item.stockPhoto=true; item.photoCredit=data.photo.credit||data.photo.source; done++; }
      }else if(res.ok){ item.photoTried=true; }         // genuinely no photo out there; don't keep asking
    }catch(e){ console.warn("Photo backfill",e); }
  }
  if(todo.length) saveState();
  if(done) refreshCurrentView();
  return done;
}
async function addLookupToWishlist(){
  const L=lastLookup, r=L?.result; if(!r?.scientific) return;
  const speciesKey=slug(r.scientific);
  const id="discovery-"+Date.now(), photoKey=`${id}-hero`;
  const btn=document.querySelector(".lookup-actions .btn.primary");
  if(btn){ btn.disabled=true; btn.textContent="Saving…"; }
  const stored=L.photo?await storeReferencePhoto(L.photo,photoKey):false;
  // Gemini's details become the species' gap-filled record; real sources still win later.
  const fieldKeys=["light","water","soil","height","hardiness","growthHabit","growthRate","pruning","propagation","safety","description"];
  const fields={};
  fieldKeys.forEach(k=>{ if(usable(r[k])) fields[k]=String(r[k]).trim(); });
  const months=[...new Set((r.bloomMonths||[]).map(Number).filter(n=>n>=1&&n<=12))].sort((a,b)=>a-b);
  if(months.length&&months.length<12) fields.bloomMonths=months;
  const cache=state.speciesCache[speciesKey]||{scientific:r.scientific,common:r.common,family:r.family,genus:r.genus,source:"Plant lookup",fetchedAt:new Date().toISOString(),enrichment:null};
  state.speciesCache[speciesKey]={...cache,gemini:{fields,asked:Object.keys(fields),fetchedAt:new Date().toISOString(),model:L.model||"gemini"}};
  state.discoveries.unshift({
    id,speciesKey,photoKey:stored?photoKey:"",photoUrl:!stored&&L.photo?.url?L.photo.url:null,
    common:r.common||r.scientific,scientific:r.scientific,family:r.family||"",
    score:null,spotted:new Date().toISOString(),wishlist:true,note:"",
    source:"lookup",species:r.species||"",stockPhoto:!!(stored||L.photo?.url),photoCredit:L.photo?(L.photo.credit||L.photo.source):null
  });
  saveState();
  toast(`${r.common||r.scientific} added to your wishlist`);
  setRoute("discover");
  setTimeout(fillGardenGaps,1500);    // fetch the real botanical sources in the background
}
// When she scans the real plant, her photo replaces any reference photo for that species.
async function replaceStockPhotos(speciesKey,file){
  let n=0;
  for(const item of [...state.discoveries,...state.plants]){
    if(item.speciesKey!==speciesKey||!item.stockPhoto) continue;
    const key=item.photoKey||`${item.id}-hero`;
    try{ await savePhoto(key,file); item.photoKey=key; item.photoUrl=null; item.stockPhoto=false; item.photoCredit=null; n++; }catch(e){ console.warn(e); }
  }
  if(n) saveState();
  return n;
}

function renderDiscover(){
  const items=state.discoveries;
  const families=new Set(items.map(d=>d.family).filter(Boolean)).size;
  const wishlist=items.filter(d=>d.wishlist).length;

  view.innerHTML=`<section class="page-head"><div class="eyebrow">Saved inspiration</div><h1>Discover</h1><p class="sub">Plants you've spotted, loved or might want to bring home one day.</p></section>
    <button class="lens-banner discover-banner" onclick="startCamera('discover')">
      <span class="lens-icon">⌾</span><span><strong>Identify while you're out</strong><small>Snap it at the garden centre: FloraLens identifies it and tells you if it's a good buy.</small></span>
    </button>
    ${lookupCard()}
    <div class="stats-strip"><div class="stat"><b>${items.length}</b><small>discoveries</small></div><div class="stat"><b>${families}</b><small>families</small></div><div class="stat"><b>${wishlist}</b><small>wishlist</small></div></div>
    ${items.length
      ? `<section class="masonry discovery-masonry">${items.map(d=>`<article class="pin discovery-pin" onclick="if(!event.target.closest('button')) setRoute('profile',{id:'${d.id}'})">
          <div class="discovery-media">
            <div class="plant-art" data-photo-key="${esc(d.photoKey||"")}" data-photo-url="${esc(d.photoUrl||"")}"></div>
            ${buyBadge(d)}
            <div class="discovery-controls">
              <button class="wishlist-heart ${d.wishlist?"active":""}" onclick="event.stopPropagation();toggleWishlist('${d.id}')" aria-label="Wishlist">${d.wishlist?"♥":"♡"}</button>
              <button class="pin-delete" aria-label="Delete ${esc(d.common)}" onclick="event.stopPropagation();confirmDeleteDiscovery('${d.id}')">×</button>
            </div>
          </div>
          <div class="pin-body">
            <b>${esc(d.common)}</b><small><i>${esc(d.scientific)}</i></small>
            <div class="discovery-meta"><span class="chip">${d.score?`${d.score}% match`:d.source==="lookup"?"Looked up":"Saved"}</span><span class="chip">${d.wishlist?"Wishlist":"Spotted"}</span>${d.stockPhoto?`<span class="chip chip-ref">Reference photo</span>`:""}</div>
            <button class="mini-action" onclick="event.stopPropagation();addDiscoveryToGarden('${d.id}')">＋ Add to Garden</button>
          </div>
        </article>`).join("")}</section>`
      : `<div class="empty-card" style="text-align:center;padding:38px 22px"><div style="font-size:52px;color:var(--rose)">❀</div><h2 style="font-size:27px">Your botanical scrapbook</h2><p class="sub">Identify something you like without adding it to your garden. Save it here, wishlist it, or bring it into My Garden later.</p><button class="btn primary" onclick="startCamera('discover')">Find something</button></div>`}`;
  hydratePhotos();
}

/* ===================== Plant Doctor (Gemini, via the FloraLens Worker) ===================== */
const DOCTOR_MAX_PHOTOS=3;
let doctorCaptures=[];      // [{file,dataUrl}]
let doctorNote="";
let doctorAnswers={};       // {question: "Yes"|"No"|"Not sure"}
let doctorThread=[];        // [{q,a}] follow-up questions in this check
let doctorBusy=false;

function openPlantDoctor(){
  if(!state.plants.length){
    modal(`<div class="eyebrow">Plant Doctor</div><h2>Add the plant first</h2><p class="sub">Plant Doctor checks plants in My Garden, so it can use what FloraLens already knows about them.</p><button class="btn primary" style="width:100%" onclick="closeModal();startCamera('identify')">Identify a plant</button>`);
    return;
  }
  modal(`<div class="eyebrow">Plant Doctor</div><h2>Which plant looks unwell?</h2><p class="sub">Choose it, then photograph whatever is worrying you.</p>
    <div class="doctor-plant-list">${state.plants.map(p=>`<button class="destination-choice" onclick="chooseDoctorPlant('${p.id}')"><span class="area-list-photo ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}"></span><div><b>${esc(p.common)}</b><small>${esc(p.scientific)} · ${esc(p.area||"Unplaced")}</small></div></button>`).join("")}</div>`);
  hydratePhotos();
}
function chooseDoctorPlant(id){
  doctorPlantId=id; doctorCaptures=[]; doctorNote=""; doctorAnswers={}; doctorThread=[]; doctorLastResult=null;
  closeModal();
  document.getElementById("doctorCameraInput")?.click();
}
async function handleDoctorPhoto(file){
  if(!file||!String(file.type).startsWith("image/")) return;
  if(doctorCaptures.length>=DOCTOR_MAX_PHOTOS) return;
  doctorCaptures.push({file,dataUrl:await fileToDataUrl(file)});
  renderDoctorReview();
}
function removeDoctorCapture(i){
  doctorCaptures.splice(i,1);
  if(doctorCaptures.length) renderDoctorReview(); else setRoute("lens");
}
function addDoctorPhoto(){ if(doctorCaptures.length<DOCTOR_MAX_PHOTOS) document.getElementById("doctorCameraInput")?.click(); }
function renderDoctorReview(){
  const p=state.plants.find(x=>x.id===doctorPlantId);
  if(!p) return setRoute("lens");
  currentRoute="lens";
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Plant Doctor</div><h1>${esc(p.common)}</h1><p class="sub">${doctorCaptures.length===1?"A second photo of the whole plant helps a lot.":"Add a note if you've noticed anything, then check its health."}</p></section>
    <div class="doctor-shots">${doctorCaptures.map((c,i)=>`<div class="doctor-shot"><img src="${c.dataUrl}" alt="Photo ${i+1}"><button class="capture-remove" aria-label="Remove photo" onclick="removeDoctorCapture(${i})">×</button></div>`).join("")}
      ${doctorCaptures.length<DOCTOR_MAX_PHOTOS?`<button class="doctor-shot doctor-shot-add" onclick="addDoctorPhoto()"><span>📷</span><b>Add photo</b><small>${DOCTOR_MAX_PHOTOS-doctorCaptures.length} more allowed</small></button>`:""}</div>
    <label class="field-label" for="doctorNote">What have you noticed? <span style="font-weight:500;color:var(--muted)">(optional)</span></label>
    <textarea id="doctorNote" class="journal-field journal-textarea" maxlength="400" placeholder="e.g. leaves going yellow and dropping off" oninput="doctorNote=this.value">${esc(doctorNote)}</textarea>
    <div class="doctor-tips"><b>For the best result</b><p>Daylight, no flash. One sharp close-up of the problem, plus one of the whole plant.</p></div>
    <button class="btn primary" style="width:100%;margin-top:14px" onclick="runPlantDoctor()">✚ Check health</button>
    <button class="btn outline" style="width:100%;margin-top:10px" onclick="setRoute('lens')">Cancel</button>`;
}

// Shrink photos before sending: faster on mobile data and well under request limits.
async function doctorImagePayload(file,maxSide=1280){
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url;});
    const scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
    const c=document.createElement("canvas");
    c.width=Math.round(img.naturalWidth*scale); c.height=Math.round(img.naturalHeight*scale);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    return {mime_type:"image/jpeg",data:c.toDataURL("image/jpeg",0.84).split(",")[1]};
  }finally{ URL.revokeObjectURL(url); }
}

// Everything FloraLens already knows, so she never has to type it.
function doctorContext(p){
  const intel=state.speciesCache[p.speciesKey]?.enrichment||null;
  const care=resolvedCare(p.scientific,intel?.trefle||null,intel?.perenual||null,p.speciesKey);
  const now=new Date();
  const lines=[
    `Plant: ${p.common} (${p.scientific}${p.family?`, ${p.family}`:""})`,
    `Where: ${p.area||"not recorded"}, UK garden`,
    `Today: ${now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})} (${currentSeasonName()})`,
    p.added?`In the garden since: ${p.added}`:null
  ];
  const careLines=[["Light",care.light],["Water",care.water],["Soil",care.soil],["Hardiness",care.hardiness],["Pruning",care.pruning]].filter(([,v])=>usable(v)).map(([k,v])=>`${k}: ${v}`);
  if(careLines.length) lines.push("Care record:",...careLines.map(x=>"- "+x));
  const notes=state.journal.filter(j=>j.plantId===p.id&&j.text).slice(0,6);
  const wx=weatherContextLine(); if(wx) lines.push(wx);
  if(notes.length) lines.push("Recent journal (newest first):",...notes.map(j=>`- ${j.date} [${j.type}] ${j.text.slice(0,220)}`));
  return lines.filter(Boolean).join("\n");
}

async function callPlantDoctor(extra={}){
  if(!API_PROXY_URL) throw new Error("Plant Doctor needs the FloraLens Worker to be set up.");
  const p=state.plants.find(x=>x.id===doctorPlantId);
  const images=await Promise.all(doctorCaptures.map(c=>doctorImagePayload(c.file)));
  const body={
    images,
    context:doctorContext(p),
    note:doctorNote.trim(),
    answers:Object.entries(doctorAnswers).map(([q,a])=>({q,a})),
    previous:doctorLastResult?.data||null,
    history:doctorThread.filter(t=>t.a),
    ...extra
  };
  const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/doctor`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>null);
  if(!data){
    if(res.status===404) throw new Error("The Worker doesn't have a /doctor route yet. Add worker-gemini.js and redeploy.");
    throw new Error(`Plant Doctor couldn't reach Gemini (${res.status}). Try again in a moment.`);
  }
  if(!res.ok||data.error){
    if(res.status===429||res.status===402){ noteGeminiPause(data); throw new Error(data.error||"Gemini's limit is reached for now. Try again later."); }
    if(res.status===403) throw new Error("This copy of FloraLens isn't on the Worker's allowed list. Check ALLOWED_ORIGINS in the Worker.");
    throw new Error(data.error||`Plant Doctor failed (${res.status}).`);
  }
  clearGeminiPause();
  return data.result;
}

function renderDoctorLoading(){
  const p=state.plants.find(x=>x.id===doctorPlantId);
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Plant Doctor</div><h1>Checking ${p?esc(p.common):"your plant"}…</h1><p class="sub">Looking at your ${doctorCaptures.length===1?"photo":`${doctorCaptures.length} photos`} alongside what FloraLens knows about this plant.</p></section>
    <div class="doctor-photo-hero"><img src="${doctorCaptures[0].dataUrl}" alt=""><div class="identify-overlay"><div><div class="flower-loader">✚</div><h2 style="margin:14px 0 5px">Taking a close look</h2><p style="opacity:.85">This usually takes 5 to 15 seconds.</p></div></div></div>`;
}
async function runPlantDoctor(){
  const p=state.plants.find(x=>x.id===doctorPlantId);
  if(!p||!doctorCaptures.length||doctorBusy) return;
  doctorBusy=true;
  doctorAnswers={}; doctorThread=[]; doctorLastResult=null;
  renderDoctorLoading();
  try{
    const data=await callPlantDoctor();
    doctorLastResult={data,checkedAt:new Date().toISOString(),error:null};
  }catch(err){
    doctorLastResult={data:null,error:friendlyNetError(err,"Plant Doctor"),checkedAt:new Date().toISOString()};
  }finally{ doctorBusy=false; }
  renderDoctorResult();
}

function setDoctorAnswer(i,ans){
  const q=doctorLastResult?.data?.quick_checks?.[i]; if(!q) return;
  if(doctorAnswers[q]===ans) delete doctorAnswers[q]; else doctorAnswers[q]=ans;
  document.querySelectorAll(`[data-q="${i}"] button`).forEach(b=>b.classList.toggle("on",b.dataset.a===doctorAnswers[q]));
  const n=Object.keys(doctorAnswers).length;
  const btn=document.getElementById("doctorUpdate");
  if(btn){ btn.hidden=!n; btn.textContent=n===1?"↻ Update with my answer":"↻ Update with my answers"; }
}
async function updateDoctorWithAnswers(){
  if(doctorBusy||!Object.keys(doctorAnswers).length) return;
  doctorBusy=true;
  const btn=document.getElementById("doctorUpdate");
  if(btn){btn.disabled=true;btn.textContent="Updating…";}
  try{
    const data=await callPlantDoctor();
    const keepAnswers={...doctorAnswers};
    doctorLastResult={...doctorLastResult,data,error:null};
    doctorAnswers={};                       // new result brings new quick checks
    doctorLastResult.answered=[...(doctorLastResult.answered||[]),...Object.entries(keepAnswers).map(([q,a])=>({q,a}))];
    doctorBusy=false;
    renderDoctorResult(true);
  }catch(err){
    doctorBusy=false;
    toast(friendlyNetError(err,"Updating").slice(0,80));
    if(btn){btn.disabled=false;btn.textContent="↻ Try again";}
  }
}
async function askDoctor(q){
  q=String(q||"").trim();
  if(!q||doctorBusy||!doctorLastResult?.data) return;
  doctorBusy=true;
  const entry={q,a:null};
  doctorThread.push(entry);
  renderDoctorThread();
  const input=document.getElementById("doctorAsk"); if(input) input.value="";
  try{
    const data=await callPlantDoctor({question:q,history:doctorThread.filter(t=>t.a)});
    entry.a=data.answer||"I couldn't find a clear answer to that from these photos.";
    if(Array.isArray(data.follow_up_questions)&&data.follow_up_questions.length) doctorLastResult.data.follow_up_questions=data.follow_up_questions;
  }catch(err){
    entry.a=friendlyNetError(err,"Asking a question"); entry.failed=true;
  }finally{ doctorBusy=false; }
  renderDoctorThread();
}
function renderDoctorThread(){
  const box=document.getElementById("doctorThread"); if(!box) return;
  box.innerHTML=doctorThread.map(t=>`<div class="ai-msg ai-msg-q">${esc(t.q)}</div>${t.a===null?`<div class="ai-msg ai-msg-a ai-typing"><i></i><i></i><i></i></div>`:`<div class="ai-msg ai-msg-a ${t.failed?"failed":""}">${esc(t.a)}</div>`}`).join("");
  const chips=document.getElementById("doctorChips");
  const asked=new Set(doctorThread.map(t=>t.q));
  if(chips) chips.innerHTML=(doctorLastResult?.data?.follow_up_questions||[]).filter(q=>!asked.has(q)).slice(0,3).map(q=>`<button onclick="askDoctor(decodeURIComponent('${jsArg(q)}'))">${esc(q)}</button>`).join("");
  box.lastElementChild?.scrollIntoView({behavior:"smooth",block:"nearest"});
}

const DOCTOR_STATUS={
  healthy:{cls:"ok",label:"Looks healthy"},
  watch:{cls:"watch",label:"Keep an eye on it"},
  act:{cls:"act",label:"Act soon"},
  unclear:{cls:"unclear",label:"Can't tell yet"}
};
const DOCTOR_CONF={likely:"Likely",possible:"Possible",unsure:"Unsure"};
const DOCTOR_LIKELY={higher:72,medium:45,lower:22,ruled_out:6};

function renderDoctorResult(updated=false){
  const p=state.plants.find(x=>x.id===doctorPlantId);
  if(!p||!doctorLastResult) return;
  const {data,error}=doctorLastResult;
  const when=new Date(doctorLastResult.checkedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"});
  const hero=`<div class="ai-hero"><img src="${doctorCaptures[0].dataUrl}" alt="Your photo"><div class="shade"></div>
    <div class="top"><span>${esc(p.area||"Garden")}</span><span>Checked ${esc(when)}</span></div>
    <div class="cap"><b>${esc(p.scientific)}</b><small>${doctorCaptures.length} photo${doctorCaptures.length>1?"s":""}</small></div></div>
    ${doctorNote.trim()?`<div class="ai-note"><span>✎</span><p><i>Your note:</i> “${esc(doctorNote.trim())}”</p></div>`:""}`;

  if(error||!data){
    view.innerHTML=`<section class="page-head" style="padding-bottom:6px"><div class="eyebrow">Plant Doctor</div><h1 style="font-size:32px">${esc(p.common)}</h1></section>${hero}
      <section class="ai-verdict ai-unclear"><div class="ai-verdict-top"><span class="ai-pill">Couldn't check</span></div><h2>Something went wrong</h2><p>${esc(error||"No answer came back.")}</p></section>
      <div class="actions" style="margin-top:16px"><button class="btn primary" onclick="runPlantDoctor()">↻ Try again</button><button class="btn secondary" onclick="retakeDoctorPhoto()">New photos</button></div>
      <button class="btn outline" style="width:100%" onclick="setRoute('lens')">Done</button>`;
    return;
  }

  const st=DOCTOR_STATUS[data.status]||DOCTOR_STATUS.unclear;
  const sev=Math.max(0,Math.min(3,Number(data.seriousness)||0));
  const list=(arr)=>Array.isArray(arr)?arr.filter(Boolean).slice(0,5):[];
  const doNow=list(data.do_now), avoid=list(data.avoid), checks=list(data.quick_checks).slice(0,3), alts=list(data.could_also_be);
  const answered=doctorLastResult.answered||[];
  const recheck=Number(data.recheck_in_days)||0;
  const recheckDate=recheck?new Date(Date.now()+recheck*86400000):null;

  view.innerHTML=`<section class="page-head" style="padding-bottom:6px"><div class="eyebrow">Plant Doctor</div><h1 style="font-size:32px">${esc(p.common)}</h1></section>
    ${hero}
    <section class="ai-verdict ai-${st.cls}${updated?" ai-flash":""}">
      <div class="ai-verdict-top"><span class="ai-pill">${esc(DOCTOR_CONF[data.confidence]||st.label)}</span>${data.status!=="unclear"?`<span class="ai-sev">${sev?"Seriousness":"Nothing serious"} <i>${[1,2,3].map(n=>`<b class="${n<=sev?"on":""}"></b>`).join("")}</i></span>`:""}</div>
      <h2>${esc(data.verdict||st.label)}</h2>
      ${data.subtitle?`<p class="ai-sci">${esc(data.subtitle)}</p>`:""}
      ${data.why?`<p>${esc(data.why)}</p>`:""}
      ${answered.length?`<p class="ai-answered">Updated using your answers: ${answered.map(x=>`${esc(x.q.replace(/\?$/,""))}: <b>${esc(x.a)}</b>`).join(" · ")}</p>`:""}
    </section>
    ${data.photo_tip?`<div class="ai-tip ai-tip-photo"><span>📷</span><div><small>A better photo would help</small><p>${esc(data.photo_tip)}</p></div></div>`:""}
    ${checks.length?`<section class="ai-block" data-ico="question"><div class="ai-block-head"><span>?</span><div><h3>Quick checks</h3><small>Answer any you can to sharpen the result</small></div></div>
      ${checks.map((q,i)=>`<div class="ai-q" data-q="${i}"><p>${esc(q)}</p><div class="opts">${["Yes","No","Not sure"].map(a=>`<button data-a="${a}" onclick="setDoctorAnswer(${i},'${a}')">${a}</button>`).join("")}</div></div>`).join("")}
      <button id="doctorUpdate" class="btn primary" style="width:100%;margin-top:12px" hidden onclick="updateDoctorWithAnswers()">↻ Update with my answers</button></section>`:""}
    ${doNow.length?`<section class="ai-block" data-ico="check"><div class="ai-block-head"><span>✓</span><div><h3>${data.status==="healthy"?"Keep doing":"Do this now"}</h3>${data.effort?`<small>${esc(data.effort)}</small>`:""}</div></div><div class="ai-list">${doNow.map(x=>`<div><span>✓</span><p>${esc(x)}</p></div>`).join("")}</div></section>`:""}
    ${avoid.length?`<section class="ai-block" data-ico="alert"><div class="ai-block-head"><span>!</span><div><h3>Avoid</h3></div></div><div class="ai-list">${avoid.map(x=>`<div><span>×</span><p>${esc(x)}</p></div>`).join("")}</div></section>`:""}
    ${alts.length?`<section class="ai-block"><div class="ai-block-head"><span class="ai-ico-violet">⌕</span><div><h3>Could also be</h3></div></div><div class="ai-alts">${alts.map(a=>`<div><div><b>${esc(a.name||"")}</b>${a.note?`<small>${esc(a.note)}</small>`:""}</div><span class="bar"><i style="width:${DOCTOR_LIKELY[a.likelihood]??30}%"></i></span></div>`).join("")}</div></section>`:""}
    ${data.next_season?`<div class="ai-tip"><span>🌱</span><div><small>For next time</small><p>${esc(data.next_season)}</p></div></div>`:""}
    ${data.safety_note?`<div class="ai-tip ai-tip-safety"><span>!</span><div><small>Safety</small><p>${esc(data.safety_note)}</p></div></div>`:""}
    ${recheckDate&&data.status!=="healthy"?`<div class="ai-recheck"><div class="cal"><small>${recheckDate.toLocaleDateString("en-GB",{month:"short"}).toUpperCase()}</small><b>${recheckDate.getDate()}</b></div><div><strong>Re-check in ${recheck} day${recheck>1?"s":""}</strong><em>Added to Care when you save this check.</em></div></div>`:""}
    <section class="ai-ask"><h3>Ask about this</h3>
      <div id="doctorThread" class="ai-thread"></div>
      <div id="doctorChips" class="ai-chips"></div>
      <form class="ai-input" onsubmit="event.preventDefault();askDoctor(document.getElementById('doctorAsk').value)">
        <input id="doctorAsk" maxlength="300" autocomplete="off" placeholder="Ask anything about ${esc(p.common)}…"><button aria-label="Ask">→</button></form>
    </section>
    <div class="actions" style="margin-top:18px"><button class="btn primary" onclick="saveDoctorToJournal()">Save to plant story</button><button class="btn secondary" onclick="retakeDoctorPhoto()">New photos</button></div>
    <button class="btn outline" style="width:100%" onclick="setRoute('lens')">Done</button>
    <p class="ai-foot">Plant Doctor uses Google Gemini with your photos, the plant's record and your journal. It can be wrong, so check before treating.</p>`;
  renderDoctorThread();
  if(updated){ const v=document.querySelector('.ai-verdict'); if(v) appScrollTo(v.getBoundingClientRect().top-appScroller().getBoundingClientRect().top+appScrollTop()-12,true); }
}
function retakeDoctorPhoto(){
  doctorCaptures=[];doctorAnswers={};doctorThread=[];doctorLastResult=null;
  document.getElementById("doctorCameraInput")?.click();
}
async function saveDoctorToJournal(){
  const p=state.plants.find(x=>x.id===doctorPlantId);
  const data=doctorLastResult?.data;
  if(!p||!doctorCaptures.length||!data) return;
  const id="journal-"+Date.now(),photoKey=`${id}-photo`;
  try{await savePhoto(photoKey,doctorCaptures[0].file)}catch(e){console.warn(e)}
  const parts=[`Plant Doctor: ${data.verdict} (${(DOCTOR_CONF[data.confidence]||"").toLowerCase()||"unsure"}).`];
  if(data.why) parts.push(data.why);
  if(doctorNote.trim()) parts.push(`Noticed: ${doctorNote.trim()}`);
  doctorThread.filter(t=>t.a&&!t.failed).forEach(t=>parts.push(`Q: ${t.q} A: ${t.a}`));
  state.journal.unshift({id,plantId:p.id,date:localISODate(),type:data.status==="healthy"?"Note":"Problem",text:parts.join(" ").slice(0,1500),photoKey,
    doctor:{verdict:data.verdict,status:data.status,confidence:data.confidence},createdAt:new Date().toISOString()});
  const days=Number(data.recheck_in_days)||0;
  if(days>0&&data.status!=="healthy"){
    state.careTasks.push({id:"care-"+Date.now(),plantId:p.id,title:`Re-check ${p.common}`,type:"Check",due:localISODate(new Date(Date.now()+days*86400000)),
      notes:`Plant Doctor thought: ${data.verdict}. Is it spreading or improving? Run Plant Doctor again to compare.`,completed:false,createdAt:new Date().toISOString()});
  }
  saveState();
  toast(days>0&&data.status!=="healthy"?`Saved, re-check in ${days} days`:"Saved to its story");
  setRoute("profile",{id:p.id});
}

function showLensTips(){modal(`<div class="eyebrow">Photo tips</div><h2>Help FloraLens see clearly</h2><p class="sub">Fill most of the frame with the plant, use good light and photograph a distinctive flower or leaf. All images in one request should show the same individual plant.</p><button class="btn primary" style="width:100%" onclick="closeModal()">Got it</button>`)}
function modal(html){document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">${html}</div></div>`)}
function closeModal(){document.getElementById("modal")?.remove()}

document.addEventListener("click",e=>{
  const routeTarget=e.target.closest("[data-route]");
  if(!routeTarget) return;
  const route=routeTarget.dataset.route;
  if(route==="lens" && routeTarget.classList.contains("lens-nav")){
    e.preventDefault();
    setRoute("lens");
    return;
  }
  setRoute(route);
});
cameraInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],"auto"); e.target.value=""; });
galleryInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],"auto"); e.target.value=""; });
multiPhotoInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],window.captureOrgan||"auto"); e.target.value=""; });
document.getElementById("doctorCameraInput")?.addEventListener("change",e=>{
  const f=e.target.files?.[0];
  if(f)handleDoctorPhoto(f);
  e.target.value="";
});


function refreshStoredCareFields(){
  let changed=false;
  for(const p of state.plants){
    const intel=state.speciesCache[p.speciesKey]?.enrichment||null;
    const care=resolvedCare(p.scientific,intel?.trefle||null,intel?.perenual||null,p.speciesKey);
    const set=(k,v)=>{ if(usable(v) && p[k]!==v){p[k]=v;changed=true;} };
    set("sun",care.light); set("water",care.water); set("soil",care.soil); set("height",care.height);
    if(care.bloomMonths?.length && JSON.stringify(p.bloom)!==JSON.stringify(care.bloomMonths)){p.bloom=care.bloomMonths;changed=true;}
  }
  if(changed) saveState();
  return changed;
}

async function backgroundEnrichTryV7SavedRecords(){
  const records=[...state.plants,...state.discoveries].filter(p=>p?.scientific);
  if(!records.length) return;
  const unique=new Map();
  for(const p of records){
    const key=p.speciesKey||slug(p.scientific);
    if(!unique.has(key)) unique.set(key,p);
  }
  try{
    await Promise.all([...unique.values()].map(p=>preloadTryV7(p.scientific,p.speciesKey||slug(p.scientific))));
    const changed=refreshStoredCareFields();
    if(changed){
      if(currentRoute==="home") renderHome();
      else if(currentRoute==="garden") renderGarden();
      else if(currentRoute==="discover") renderDiscover();
    }
  }catch(err){
    console.warn("TRY v7 background enrichment failed",err);
  }
}


menuBtn?.addEventListener("click",()=>{
  modal(`<div class="eyebrow">FloraLens</div><h2>Garden tools</h2><button class="destination-choice" onclick="openWeatherSetup()"><span>☀</span><div><b>Garden weather</b><small>${state.weatherLocation?`Forecast for ${esc(state.weatherLocation.name)}. Tap to change.`:"Set your location for frost and rain warnings."}</small></div></button><button class="destination-choice" onclick="closeModal();setRoute('care')"><span>❧</span><div><b>Care Calendar</b><small>See upcoming jobs and seasonal suggestions.</small></div></button><button class="destination-choice" onclick="closeModal();openGardenYear()"><span>✿</span><div><b>Garden Year</b><small>See the story FloraLens is collecting this year.</small></div></button><div class="backup-card"><b>Keep your garden safe</b><p class="small">Export a single backup containing plant records, journal data, species intelligence and locally stored hero photos.</p><button class="btn primary" style="width:100%" onclick="exportBackup();closeModal()">⇩ Export backup</button></div><div class="small">FloraLens 3.3 · made for our garden</div>`);
});

renderHome();
backgroundEnrichTryV7SavedRecords();


// Work through every garden plant and discovery in the background, gently,
// so Home, Garden, Care and every profile have the filled-in details without
// each profile needing to be opened first. Each species is only ever asked once.
let gardenFillRunning=false;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function fillGardenGaps(){
  backfillReferencePhotos().catch(()=>{});
  if(gardenFillRunning||!API_PROXY_URL||!navigator.onLine) return;
  gardenFillRunning=true;
  let plantsFilled=0, details=0;
  try{
    const seen=new Set();
    const items=[...state.plants,...state.discoveries].filter(p=>p?.speciesKey && !seen.has(p.speciesKey) && seen.add(p.speciesKey));
    for(const p of items){
      if(!navigator.onLine||geminiPaused()) break;
      const g=state.speciesCache[p.speciesKey]?.gemini;
      if(g?.fetchedAt) continue;                                  // already done
      if(!state.speciesCache[p.speciesKey]){
        state.speciesCache[p.speciesKey]={scientific:p.scientific,common:p.common,family:p.family||"",source:"FloraLens",fetchedAt:new Date().toISOString(),enrichment:null};
      }
      const cache=state.speciesCache[p.speciesKey];
      let called=false;
      if(!cache.enrichment && !cache.enrichmentError){            // real sources first
        await enrichSpecies(p.scientific,p.speciesKey).catch(()=>null);
        called=true;
      }
      const filled=await fillGapsWithGemini(p);
      called=called||fillGapsWithGemini.lastCalled;
      if(filled){ plantsFilled++; details+=Object.keys(state.speciesCache[p.speciesKey]?.gemini?.fields||{}).length; }
      if(called) await pause(2500);                               // go easy on the free tier
    }
  }finally{ gardenFillRunning=false; }
  if(plantsFilled){
    refreshCurrentView();
    toast(`Gemini filled ${details} missing detail${details===1?"":"s"} across ${plantsFilled} plant${plantsFilled===1?"":"s"}`);
  }
}
function refreshCurrentView(){
  try{
    if(currentRoute==="home") renderHome();
    else if(currentRoute==="garden") renderGarden();
    else if(currentRoute==="care") renderCareCalendar();
    else if(currentRoute==="discover") renderDiscover();
    else if(currentRoute==="profile"){
      const id=view.dataset.profileId; if(!id) return;
      const tab=document.querySelector(".profile-tab.active")?.dataset.profileTab, y=appScrollTop();
      renderProfile(id).then(()=>{ if(tab) setProfileTab(tab); appScrollTo(y); });
    }
  }catch(e){ console.warn("Refresh after gap fill",e); }
}
window.addEventListener("load",()=>setTimeout(fillGardenGaps,4000));
window.addEventListener("online",()=>setTimeout(fillGardenGaps,3000));
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") setTimeout(fillGardenGaps,3000); });

// Keep the seasonal backdrop right if the app stays open across a change of season.
function applySeasonTheme(){
  const m=new Date().getMonth()+1;
  const season=m>=3&&m<=5?"spring":m>=6&&m<=8?"summer":m>=9&&m<=11?"autumn":"winter";
  if(document.documentElement.dataset.season!==season) document.documentElement.dataset.season=season;
}
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") applySeasonTheme(); });

/* ===================== Native app behaviour =====================
   The page itself never scrolls: only the content area between the header and
   the tab bar does. That removes the whole-page bounce, sideways drift and
   pinch-zoom that make a web app feel like a website. */
function appScroller(){ return document.getElementById("view")||document.scrollingElement; }
function appScrollTop(){ return appScroller().scrollTop; }
function appScrollTo(top,smooth=false){ appScroller().scrollTo({top:Math.max(0,top),behavior:smooth?"smooth":"auto"}); }
(function nativeFeel(){
  // No pinch-zoom (iOS ignores user-scalable=no, so stop its gesture events too)
  ["gesturestart","gesturechange","gestureend"].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
  document.addEventListener("touchmove",e=>{ if(e.touches.length>1) e.preventDefault(); },{passive:false});
  // No long-press "Save image / Copy" menus on photos and buttons
  document.addEventListener("contextmenu",e=>{ if(!e.target.closest("input,textarea,.ai-msg-a,.journal-entry p")) e.preventDefault(); });
  // Lock to portrait where the platform allows it (Android home-screen apps); iOS shows the rotate screen instead
  try{ screen.orientation?.lock?.("portrait").catch(()=>{}); }catch{}
  // Stop any stray sideways scroll offset on the content area
  const v=document.getElementById("view");
  if(v) v.addEventListener("scroll",()=>{ if(v.scrollLeft) v.scrollLeft=0; },{passive:true});
})();

/* ===================== Home-screen app: offline + updates ===================== */
function updateOnlineState(){
  document.body.classList.toggle("is-offline",!navigator.onLine);
  let pill=document.getElementById("offlinePill");
  if(!navigator.onLine){
    if(!pill){
      document.querySelector(".topbar")?.insertAdjacentHTML("afterend",`<div id="offlinePill" class="offline-pill" role="status"><span></span>Offline. Your garden, journal and care still work.</div>`);
    }
  }else pill?.remove();
}
window.addEventListener("online",()=>{updateOnlineState();toast("Back online");});
window.addEventListener("offline",updateOnlineState);
updateOnlineState();

function showUpdateReady(worker){
  if(document.getElementById("updateBar")) return;
  document.body.insertAdjacentHTML("beforeend",`<div id="updateBar" class="update-bar" role="status"><div><b>Update ready</b><small>A new version of FloraLens is available.</small></div><button id="updateNow">Update</button></div>`);
  document.getElementById("updateNow").onclick=()=>{
    document.getElementById("updateNow").textContent="Updating…";
    worker.postMessage("SKIP_WAITING");
  };
}
if("serviceWorker" in navigator && location.protocol!=="file:"){
  let reloading=false;
  const hadController=!!navigator.serviceWorker.controller; // first install: no reload needed
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(reloading||!hadController) return; reloading=true; location.reload(); });
  window.addEventListener("load",async()=>{
    try{
      const reg=await navigator.serviceWorker.register("sw.js");
      if(reg.waiting && navigator.serviceWorker.controller) showUpdateReady(reg.waiting);
      reg.addEventListener("updatefound",()=>{
        const w=reg.installing; if(!w) return;
        w.addEventListener("statechange",()=>{ if(w.state==="installed" && navigator.serviceWorker.controller) showUpdateReady(w); });
      });
      // Home-screen apps can stay open for days; check for a new version whenever she comes back to it.
      document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") reg.update().catch(()=>{}); });
    }catch(err){ console.warn("Service worker registration failed",err); }
  });
}
