/**
 * ═══════════════════════════════════════════════════════════════
 * CHRONO — app.js
 * Sections:
 *   1.  Historical Templates Data
 *   2.  State
 *   3.  DOM refs
 *   4.  Utils
 *   5.  Welcome Screen
 *   6.  App Shell show/hide
 *   7.  Canvas — pan & zoom
 *   8.  Events — create / edit / delete
 *   9.  Node rendering
 *   10. Node interaction — click / card
 *   11. Node drag & drop
 *   12. Connections (SVG)
 *   13. Connect mode
 *   14. Context menu
 *   15. Mini-map
 *   16. Story mode
 *   17. Templates panel
 *   18. New timeline flow
 *   19. Export / Import
 *   20. Keyboard shortcuts
 *   21. Init
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. HISTORICAL TEMPLATES DATA
═══════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  {
    id: 'ww1',
    name: 'World War I',
    era: '1914 – 1918',
    preview: 'From the assassination of Archduke Franz Ferdinand to the Armistice',
    events: [
      { title: 'Assassination of Archduke Franz Ferdinand', desc: 'Archduke Franz Ferdinand of Austria-Hungary and his wife Sophie are assassinated in Sarajevo by Gavrilo Princip, a Bosnian-Serb nationalist. The event triggers a chain reaction of declarations of war across Europe.', date: 'June 28, 1914', side: 'above', stemHeight: 90 },
      { title: 'Austria-Hungary Declares War on Serbia', desc: 'Following Serbia\'s partial rejection of its ultimatum, Austria-Hungary formally declares war. Russia begins mobilizing in support of Serbia, escalating the crisis across the continent.', date: 'July 28, 1914', side: 'below', stemHeight: 70 },
      { title: 'Germany Declares War on Russia & France', desc: 'Germany invokes the Schlieffen Plan, declaring war on Russia (Aug 1) and France (Aug 3). The plan calls for a rapid defeat of France through Belgium before turning to face Russia in the east.', date: 'Aug 1–3, 1914', side: 'above', stemHeight: 110 },
      { title: 'Britain Enters the War', desc: 'Following Germany\'s invasion of neutral Belgium, Britain declares war on Germany. The conflict is now truly world-spanning, drawing in colonial forces from Africa, Asia, and the Americas.', date: 'Aug 4, 1914', side: 'below', stemHeight: 60 },
      { title: 'First Battle of the Marne', desc: 'Allied forces halt the German advance into France, ending any hope of a swift German victory. The war shifts to static trench warfare along the Western Front — a line that will barely move for four years.', date: 'Sep 1914', side: 'above', stemHeight: 95 },
      { title: 'Battle of Verdun Begins', desc: 'Germany launches a massive offensive at Verdun designed to bleed France white. The battle lasts 10 months, resulting in roughly 700,000 casualties. It becomes the longest and one of the most devastating battles of the war.', date: 'Feb 21, 1916', side: 'below', stemHeight: 80 },
      { title: 'Battle of the Somme', desc: 'The British-led offensive on the Somme results in nearly 60,000 British casualties on the first day alone — the bloodiest day in British military history. The battle lasts until November, gaining just a few miles of territory.', date: 'Jul 1, 1916', side: 'above', stemHeight: 115 },
      { title: 'USA Enters the War', desc: 'After Germany resumes unrestricted submarine warfare and the revelation of the Zimmermann Telegram (proposing a German-Mexican alliance), the United States declares war on Germany, bringing fresh troops and resources to the Allies.', date: 'Apr 6, 1917', side: 'below', stemHeight: 75 },
      { title: 'Russian Revolution & Exit', desc: 'The October Revolution topples the Tsar. The Bolshevik government, seeking to end Russian involvement, signs the Treaty of Brest-Litovsk with Germany, freeing German divisions to move west.', date: '1917', side: 'above', stemHeight: 100 },
      { title: 'The Hundred Days Offensive', desc: 'The Allied Powers launch a massive counter-offensive beginning with the Battle of Amiens. German forces are pushed back continuously over 100 days, collapsing morale and triggering political crisis in Germany.', date: 'Aug 8, 1918', side: 'below', stemHeight: 65 },
      { title: 'Armistice — War Ends', desc: 'At 11:00 AM on November 11, an armistice is signed in a railway carriage in the Compiègne forest. Guns fall silent on the Western Front. The war leaves 20 million dead and reshapes the world order entirely.', date: 'Nov 11, 1918', side: 'above', stemHeight: 105 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[4,6],[7,9]]
  },
  {
    id: 'ww2',
    name: 'World War II',
    era: '1939 – 1945',
    preview: 'From the invasion of Poland to the atomic bombings and Allied victory',
    events: [
      { title: 'Germany Invades Poland', desc: 'Germany launches a Blitzkrieg invasion of Poland using tanks, aircraft, and motorized infantry. Britain and France declare war on Germany two days later. The Soviet Union invades Poland from the east on September 17, following the Molotov-Ribbentrop Pact.', date: 'Sep 1, 1939', side: 'above', stemHeight: 85 },
      { title: 'Fall of France', desc: 'Germany bypasses the Maginot Line through the Ardennes, encircling Allied forces. France falls in six weeks — a stunning defeat. The British Expeditionary Force is evacuated from Dunkirk, and France signs an armistice on June 22.', date: 'May–Jun 1940', side: 'below', stemHeight: 75 },
      { title: 'Battle of Britain', desc: 'The RAF defeats the Luftwaffe\'s attempt to achieve air superiority over Britain — a prerequisite for a German invasion. The battle is the first major campaign fought entirely by air forces. Churchill\'s famous speech: "Never was so much owed by so many to so few."', date: 'Jul–Oct 1940', side: 'above', stemHeight: 110 },
      { title: 'Operation Barbarossa', desc: 'Germany invades the Soviet Union with 3 million troops across a 2,900 km front — the largest military operation in history. Initial advances are staggering, but German forces are halted short of Moscow as winter sets in.', date: 'Jun 22, 1941', side: 'below', stemHeight: 90 },
      { title: 'Attack on Pearl Harbor', desc: 'Japan launches a surprise attack on the US naval base at Pearl Harbor, Hawaii, destroying or damaging 19 ships and killing over 2,400 Americans. The United States declares war on Japan the next day; Germany and Italy declare war on the US four days later.', date: 'Dec 7, 1941', side: 'above', stemHeight: 100 },
      { title: 'Battle of Stalingrad', desc: 'One of the largest and deadliest battles in history. The Soviet counter-offensive Operation Uranus encircles the German Sixth Army. Germany suffers its worst defeat — 800,000 Axis casualties — marking the turning point on the Eastern Front.', date: 'Aug 1942 – Feb 1943', side: 'below', stemHeight: 70 },
      { title: 'D-Day — Normandy Landings', desc: 'Operation Overlord: 156,000 Allied troops storm five beaches in Normandy, France, in the largest seaborne invasion in history. Despite heavy casualties, the beachhead is secured, opening a second front and beginning the liberation of Western Europe.', date: 'Jun 6, 1944', side: 'above', stemHeight: 120 },
      { title: 'Liberation of Paris', desc: 'Allied forces liberate Paris after four years of German occupation. General de Gaulle leads a triumphant march down the Champs-Élysées. The liberation is a massive symbolic and psychological blow to Germany.', date: 'Aug 25, 1944', side: 'below', stemHeight: 65 },
      { title: 'Battle of the Bulge', desc: 'Germany\'s last major offensive on the Western Front — a desperate gamble in the Ardennes. After initial surprise gains, Allied forces, including General Patton\'s Third Army, repel the attack. Germany loses irreplaceable men and equipment.', date: 'Dec 1944 – Jan 1945', side: 'above', stemHeight: 95 },
      { title: 'VE Day — Victory in Europe', desc: 'Germany surrenders unconditionally. Hitler has died by suicide in his Berlin bunker on April 30. The war in Europe is over. Millions celebrate in the streets of London, Paris, New York, and Moscow.', date: 'May 8, 1945', side: 'below', stemHeight: 80 },
      { title: 'Atomic Bombings of Hiroshima & Nagasaki', desc: 'The US drops atomic bombs on Hiroshima (Aug 6) and Nagasaki (Aug 9). Hiroshima is devastated instantly, killing 70,000–80,000 people; tens of thousands more die from radiation. The bombings shock Japan into surrender.', date: 'Aug 6–9, 1945', side: 'above', stemHeight: 105 },
      { title: 'VJ Day — Victory over Japan', desc: 'Japan announces its surrender on August 15; the formal surrender ceremony takes place on September 2 aboard USS Missouri in Tokyo Bay. World War II is over. The world begins the long process of rebuilding — and confronts the new atomic age.', date: 'Sep 2, 1945', side: 'below', stemHeight: 75 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[3,5],[4,6]]
  },
  {
    id: 'coldwar',
    name: 'The Cold War',
    era: '1947 – 1991',
    preview: 'The ideological struggle between the USA and USSR that shaped the modern world',
    events: [
      { title: 'Truman Doctrine', desc: 'President Truman pledges US support for nations threatened by communist expansion, beginning with Greece and Turkey. This marks the formal beginning of the containment strategy that will define US foreign policy for decades.', date: 'Mar 1947', side: 'above', stemHeight: 80 },
      { title: 'Berlin Blockade & Airlift', desc: 'The Soviet Union blockades West Berlin, cutting off land access. The Western Allies respond with a massive 11-month airlift, delivering supplies daily. Stalin ends the blockade in May 1949, marking the first major Cold War confrontation.', date: '1948–1949', side: 'below', stemHeight: 70 },
      { title: 'NATO Founded', desc: 'The North Atlantic Treaty Organization is established, binding Western nations to collective defense. The Soviet Union responds in 1955 with the Warsaw Pact, dividing Europe into two opposing military blocs.', date: 'Apr 1949', side: 'above', stemHeight: 95 },
      { title: 'Korean War', desc: 'North Korea, backed by China and the Soviet Union, invades South Korea. UN forces, led by the US, intervene. Three years of brutal fighting end in an armistice — not a peace treaty — restoring the original border near the 38th parallel.', date: '1950–1953', side: 'below', stemHeight: 65 },
      { title: 'Sputnik Launch', desc: 'The Soviet Union launches Sputnik 1, the world\'s first artificial satellite. The beep of Sputnik terrifies Americans — if the Soviets can reach orbit, they can reach any city on Earth with a nuclear warhead. The Space Race begins in earnest.', date: 'Oct 4, 1957', side: 'above', stemHeight: 110 },
      { title: 'Cuban Missile Crisis', desc: 'US U-2 spy planes discover Soviet nuclear missiles in Cuba. For 13 days, the world stands on the brink of nuclear war. Kennedy and Khrushchev negotiate: the Soviets remove missiles from Cuba; the US secretly removes missiles from Turkey.', date: 'Oct 1962', side: 'below', stemHeight: 90 },
      { title: 'Apollo 11 Moon Landing', desc: 'NASA astronauts Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon. Armstrong\'s famous words: "One small step for man, one giant leap for mankind." The US wins the Space Race decisively.', date: 'Jul 20, 1969', side: 'above', stemHeight: 85 },
      { title: 'Vietnam War Ends', desc: 'The fall of Saigon marks the end of the Vietnam War with a North Vietnamese victory. Despite 58,000 American lives lost and immense resources spent, the US-backed South Vietnam has fallen. A devastating loss for US credibility and containment strategy.', date: 'Apr 30, 1975', side: 'below', stemHeight: 75 },
      { title: 'Soviet Invasion of Afghanistan', desc: 'The Soviet Union invades Afghanistan to prop up its communist government. The US, Saudi Arabia, and Pakistan fund and arm the Mujahideen resistance. The conflict becomes the Soviet Union\'s Vietnam, draining resources and lives for a decade.', date: 'Dec 1979', side: 'above', stemHeight: 100 },
      { title: 'Fall of the Berlin Wall', desc: 'East Germany announces that its citizens may cross freely. Crowds gather and begin dismantling the wall with hammers. The most potent symbol of the Iron Curtain falls — signaling the imminent collapse of communist Eastern Europe.', date: 'Nov 9, 1989', side: 'below', stemHeight: 115 },
      { title: 'Dissolution of the USSR', desc: 'The Soviet Union officially ceases to exist. Fifteen independent republics emerge. Mikhail Gorbachev resigns as the last Soviet president. The Cold War is over — the United States stands as the world\'s sole superpower.', date: 'Dec 25, 1991', side: 'above', stemHeight: 80 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[4,6],[5,7]]
  },
  {
    id: 'spaceracing',
    name: 'The Space Race',
    era: '1957 – 1972',
    preview: 'Humanity\'s race from Sputnik to the Moon and beyond',
    events: [
      { title: 'Sputnik 1 — First Satellite', desc: 'The Soviet Union shocks the world by launching Sputnik 1, the first artificial Earth satellite. Its radio beeps can be picked up worldwide, demonstrating Soviet technological capability and causing widespread anxiety in the West.', date: 'Oct 4, 1957', side: 'above', stemHeight: 85 },
      { title: 'Laika in Space', desc: 'The Soviet dog Laika becomes the first animal to orbit Earth aboard Sputnik 2. The mission proves living beings can survive launch, though Laika does not survive the mission — her fate raises early questions about space ethics.', date: 'Nov 3, 1957', side: 'below', stemHeight: 70 },
      { title: 'Explorer 1 — First US Satellite', desc: 'The US responds to Sputnik with Explorer 1, its first successfully launched satellite. Explorer 1 discovers the Van Allen radiation belts — its most lasting scientific contribution. NASA is founded later in 1958.', date: 'Jan 31, 1958', side: 'above', stemHeight: 95 },
      { title: 'Yuri Gagarin — First Human in Space', desc: 'Soviet cosmonaut Yuri Gagarin orbits the Earth once in Vostok 1, completing the flight in 108 minutes. He becomes an international celebrity overnight. President Kennedy, deeply shaken, escalates the US space program dramatically.', date: 'Apr 12, 1961', side: 'below', stemHeight: 110 },
      { title: 'Kennedy\'s Moon Speech', desc: 'President Kennedy addresses Congress: "I believe that this nation should commit itself to achieving the goal, before this decade is out, of landing a man on the Moon and returning him safely to Earth." NASA\'s budget explodes.', date: 'May 25, 1961', side: 'above', stemHeight: 75 },
      { title: 'John Glenn Orbits Earth', desc: 'John Glenn becomes the first American to orbit Earth, completing three orbits aboard Friendship 7. His flight restores American confidence and makes Glenn a national hero. The US begins to close the gap with the Soviets.', date: 'Feb 20, 1962', side: 'below', stemHeight: 90 },
      { title: 'First Spacewalk — Alexei Leonov', desc: 'Soviet cosmonaut Alexei Leonov performs the first extravehicular activity (EVA), spending 12 minutes outside his spacecraft. His suit inflates dangerously in the vacuum; he barely makes it back inside. Another Soviet first.', date: 'Mar 18, 1965', side: 'above', stemHeight: 100 },
      { title: 'Apollo 1 Tragedy', desc: 'Astronauts Gus Grissom, Ed White, and Roger Chaffee are killed in a launch pad fire during a routine test of the Apollo 1 spacecraft. The disaster leads to a comprehensive redesign of the Apollo capsule and an 18-month delay.', date: 'Jan 27, 1967', side: 'below', stemHeight: 80 },
      { title: 'Apollo 8 — First to the Moon', desc: 'Astronauts Frank Borman, Jim Lovell, and William Anders become the first humans to orbit the Moon. The iconic "Earthrise" photograph — Earth rising over the lunar surface — becomes one of the most influential images ever taken.', date: 'Dec 1968', side: 'above', stemHeight: 105 },
      { title: 'Apollo 11 — Moon Landing', desc: '"The Eagle has landed." Neil Armstrong and Buzz Aldrin land on the Moon\'s Sea of Tranquility while Michael Collins orbits above. Armstrong\'s first steps on the lunar surface are watched live by an estimated 600 million people worldwide.', date: 'Jul 20, 1969', side: 'below', stemHeight: 125 },
      { title: 'Apollo 13 — Successful Failure', desc: '"Houston, we have a problem." An oxygen tank explosion cripples the spacecraft on the way to the Moon. Through extraordinary teamwork and improvisation, the crew returns safely to Earth. NASA calls it "our finest hour."', date: 'Apr 1970', side: 'above', stemHeight: 70 },
      { title: 'Last Moon Landing — Apollo 17', desc: 'Astronauts Eugene Cernan and Harrison Schmitt spend over three days on the lunar surface — the longest Apollo mission. As Cernan steps off the Moon, he becomes the last human to walk on another world. No one has returned since.', date: 'Dec 1972', side: 'below', stemHeight: 90 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[3,5],[8,10]]
  },
  {
    id: 'internet',
    name: 'The Internet Age',
    era: '1969 – 2010s',
    preview: 'From ARPANET to the smartphone era — the digital revolution',
    events: [
      { title: 'ARPANET First Message', desc: 'The first message is sent over ARPANET between UCLA and the Stanford Research Institute. The message is "LO" — the network crashes after two letters. Nevertheless, this is the birth of what will become the internet.', date: 'Oct 29, 1969', side: 'above', stemHeight: 80 },
      { title: 'TCP/IP Protocol', desc: 'Vint Cerf and Bob Kahn publish the specifications for TCP/IP, the foundational communication protocol of the internet. This allows different types of networks to communicate with each other — the key that unlocks the global internet.', date: '1974', side: 'below', stemHeight: 70 },
      { title: 'World Wide Web Invented', desc: 'Tim Berners-Lee, a British scientist at CERN, invents the World Wide Web and proposes it as a way to share information via hypertext. He creates the first web browser and web server. The first website goes live at CERN.', date: '1989–1991', side: 'above', stemHeight: 100 },
      { title: 'Mosaic Browser Released', desc: 'NCSA releases Mosaic, the first graphical web browser to display images inline with text. Suddenly, the web becomes visual and accessible to non-technical users. Web traffic grows by 341,634% in 1993 alone.', date: '1993', side: 'below', stemHeight: 75 },
      { title: 'Amazon & eBay Founded', desc: 'Jeff Bezos founds Amazon as an online bookstore; Pierre Omidyar founds eBay as an online auction site. Both companies will transform commerce globally. The dot-com boom is underway, attracting billions in venture capital.', date: '1994–1995', side: 'above', stemHeight: 90 },
      { title: 'Google Founded', desc: 'Larry Page and Sergey Brin launch Google, based on their PageRank algorithm. Google\'s clean interface and relevant results quickly make it the dominant search engine, displacing Yahoo and AltaVista.', date: 'Sep 4, 1998', side: 'below', stemHeight: 65 },
      { title: 'Dot-com Bust', desc: 'The NASDAQ peaks in March 2000 at 5,048 points then crashes, losing 78% of its value by 2002. Hundreds of internet companies fail. The bust separates sustainable businesses (Amazon, Google) from hype-driven failures.', date: '2000–2002', side: 'above', stemHeight: 110 },
      { title: 'Wikipedia Launched', desc: 'Jimmy Wales and Larry Sanger launch Wikipedia, a free, collaborative encyclopedia. It grows exponentially through volunteer contributions. Within years it becomes one of the most visited sites on the web — a radical experiment in collective knowledge.', date: 'Jan 15, 2001', side: 'below', stemHeight: 80 },
      { title: 'Facebook Goes Global', desc: 'Mark Zuckerberg opens Facebook to anyone over 13 with an email address. The site rapidly grows past 100 million users. Social networking becomes a defining feature of the digital age, transforming how people communicate and share information.', date: '2006', side: 'above', stemHeight: 95 },
      { title: 'iPhone Launched', desc: 'Steve Jobs unveils the original iPhone: "An iPod, a phone, and an internet communicator." The smartphone era begins. Within years, mobile internet traffic surpasses desktop, and billions of people carry the full power of the internet in their pockets.', date: 'Jan 9, 2007', side: 'below', stemHeight: 120 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[2,4],[4,6],[6,8]]
  },
  {
    id: 'renaissance',
    name: 'The Renaissance',
    era: '1300s – 1600s',
    preview: 'The rebirth of art, science, and humanism that transformed Europe',
    events: [
      { title: 'Black Death Sweeps Europe', desc: 'The bubonic plague kills one-third of Europe\'s population. The catastrophe disrupts feudal society, triggers labor shortages that empower peasants, and shakes faith in the Church — indirectly creating conditions for the Renaissance and Reformation.', date: '1347–1351', side: 'above', stemHeight: 80 },
      { title: 'Gutenberg\'s Printing Press', desc: 'Johannes Gutenberg develops movable type printing in Europe. The Gutenberg Bible is the first major book printed. The press revolutionizes the spread of knowledge, making books affordable and accelerating literacy, science, and the Reformation.', date: 'c. 1440', side: 'below', stemHeight: 90 },
      { title: 'Fall of Constantinople', desc: 'The Ottoman Turks under Mehmed II capture Constantinople, ending the Byzantine Empire. Byzantine scholars flee to Italy, bringing Greek manuscripts and classical knowledge that fuels the Italian Renaissance.', date: '1453', side: 'above', stemHeight: 70 },
      { title: 'Columbus Reaches the Americas', desc: 'Christopher Columbus, sponsored by Spain, reaches the Caribbean islands. Though not the first European in the Americas, his voyage opens sustained contact between the Old and New Worlds — beginning an era of global exchange, colonization, and cultural transformation.', date: '1492', side: 'below', stemHeight: 100 },
      { title: 'Da Vinci\'s Peak Work', desc: 'Leonardo da Vinci is at the height of his powers — painting the Last Supper (1495-98) and the Mona Lisa (1503-06), while filling thousands of notebook pages with engineering, anatomy, and scientific observations centuries ahead of their time.', date: '1490s–1510s', side: 'above', stemHeight: 115 },
      { title: 'Michelangelo\'s Sistine Chapel', desc: 'Michelangelo completes the ceiling of the Sistine Chapel, painting 300 figures including the iconic Creation of Adam. Working alone on scaffolding for four years, he creates what many consider the greatest artwork ever made.', date: '1508–1512', side: 'below', stemHeight: 75 },
      { title: 'Protestant Reformation', desc: 'Martin Luther nails his Ninety-Five Theses to the door of Wittenberg Castle Church, challenging Catholic Church practices. The Reformation fractures Western Christianity permanently and fuels a century of religious wars.', date: 'Oct 31, 1517', side: 'above', stemHeight: 95 },
      { title: 'Copernican Revolution', desc: 'Nicolaus Copernicus publishes "On the Revolutions of the Celestial Spheres," arguing that the Earth orbits the Sun, not vice versa. The heliocentric model overturns 1,400 years of Ptolemaic astronomy and places humanity in a new cosmic context.', date: '1543', side: 'below', stemHeight: 85 },
      { title: 'Shakespeare\'s Great Plays', desc: 'William Shakespeare writes his greatest works — Hamlet, Othello, King Lear, Macbeth — at the Globe Theatre in London. His exploration of human psychology, power, and tragedy has never been surpassed in the English language.', date: '1600–1606', side: 'above', stemHeight: 105 },
      { title: 'Galileo & the Telescope', desc: 'Galileo improves the telescope and turns it skyward, discovering Jupiter\'s moons, the phases of Venus, and sunspots. His observations confirm Copernicus. He is tried by the Inquisition and forced to recant — but the scientific revolution cannot be stopped.', date: '1609–1633', side: 'below', stemHeight: 70 },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[1,3],[3,5],[6,8]]
  },
];


/* ═══════════════════════════════════════════════════════════════
   2. STATE
═══════════════════════════════════════════════════════════════ */

const State = {
  events: [],
  connections: [],
  nextId: 1,

  panX: 0, panY: 0, zoom: 1,
  isPanning: false,
  panStartX: 0, panStartY: 0, panStartMouseX: 0, panStartMouseY: 0,

  draggingNode: null,
  dragHasMoved: false,

  connectMode: false, connectFromId: null,

  openCardId: null,
  editingId: null,
  storyIndex: 0,
  _storySorted: [],

  SNAP_GRID: 40,
  AXIS_Y: 5000,
  STEM_MIN: 50,
  STEM_MAX: 130,

  get viewportCenterX() {
    return (-State.panX + window.innerWidth / 2) / State.zoom;
  },
};


/* ═══════════════════════════════════════════════════════════════
   3. DOM REFERENCES
═══════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const DOM = {
  // Screens
  welcomeScreen:      $('welcomeScreen'),
  appShell:           $('appShell'),
  welcomeTemplates:   $('welcomeTemplates'),

  // Welcome buttons
  welcomeNew:         $('welcomeNew'),
  welcomeImport:      $('welcomeImport'),

  // Topbar
  homeBtn:            $('homeBtn'),
  timelineName:       $('timelineName'),
  zoomIn:             $('zoomIn'),
  zoomOut:            $('zoomOut'),
  zoomLabel:          $('zoomLabel'),
  addEventBtn:        $('addEventBtn'),
  exportBtn:          $('exportBtn'),
  newTimelineBtn:     $('newTimelineBtn'),
  templatesBtn:       $('templatesBtn'),
  storyModeBtn:       $('storyModeBtn'),

  // Canvas
  canvasWrapper:      $('canvasWrapper'),
  canvas:             $('canvas'),
  axisLine:           $('axisLine'),
  ticksLayer:         $('ticksLayer'),
  connectionsSvg:     $('connectionsSvg'),
  nodesLayer:         $('nodesLayer'),

  // Minimap
  minimapCanvas:      $('minimapCanvas'),
  minimapViewport:    $('minimapViewport'),
  minimapNodes:       $('minimapNodes'),

  // Status
  statusMsg:          $('statusMsg'),
  nodeCount:          $('nodeCount'),
  coordDisplay:       $('coordDisplay'),

  // Templates panel
  templatesPanel:     $('templatesPanel'),
  panelBackdrop:      $('panelBackdrop'),
  templatesPanelClose:$('templatesPanelClose'),
  templatesPanelBody: $('templatesPanelBody'),

  // Modals
  modalOverlay:       $('modalOverlay'),
  modal:              $('modal'),
  modalTitle:         $('modalTitle'),
  modalClose:         $('modalClose'),
  modalCancel:        $('modalCancel'),
  modalSave:          $('modalSave'),
  eventTitle:         $('eventTitle'),
  eventDesc:          $('eventDesc'),
  eventDate:          $('eventDate'),

  newTimelineOverlay: $('newTimelineOverlay'),
  newTlClose:         $('newTlClose'),
  newTlCancel:        $('newTlCancel'),
  newTlConfirm:       $('newTlConfirm'),
  newTlName:          $('newTlName'),

  // Other
  contextMenu:        $('contextMenu'),
  connectTooltip:     $('connectTooltip'),
  importFileInput:    $('importFileInput'),

  // Story
  storyOverlay:       $('storyOverlay'),
  storyTimelineName:  $('storyTimelineName'),
  storyProgressFill:  $('storyProgressFill'),
  storyChapters:      $('storyChapters'),
  storyStage:         $('storyStage'),
  storySlide:         $('storySlide'),
  slideEyebrow:       $('slideEyebrow'),
  slideTitle:         $('slideTitle'),
  slideBody:          $('slideBody'),
  storyIndex:         $('storyIndex'),
  storyTotal:         $('storyTotal'),
  storyPrev:          $('storyPrev'),
  storyNext:          $('storyNext'),
  storyExit:          $('storyExit'),
  storyImgCredit:     $('storyImgCredit'),
};


/* ═══════════════════════════════════════════════════════════════
   4. UTILITIES
═══════════════════════════════════════════════════════════════ */

function uid()           { return State.nextId++; }
function clamp(v, a, b)  { return Math.max(a, Math.min(b, v)); }
function snapX(x)        { return Math.round(x / State.SNAP_GRID) * State.SNAP_GRID; }
function randInt(a, b)   { return Math.floor(Math.random() * (b - a + 1)) + a; }
function findEvent(id)   { return State.events.find(e => e.id === id); }
function setStatus(msg)  { DOM.statusMsg.textContent = msg; }
function lerp(a, b, t)   { return a + (b - a) * t; }

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function applyTransform() {
  DOM.canvas.style.transform =
    `translate(${State.panX}px, ${State.panY}px) scale(${State.zoom})`;
}

function viewportToCanvas(vx, vy) {
  return { x: (vx - State.panX) / State.zoom, y: (vy - State.panY) / State.zoom };
}

function updateNodeCount() {
  const n = State.events.length;
  DOM.nodeCount.textContent = `${n} event${n !== 1 ? 's' : ''}`;
}

function updateZoomLabel() {
  DOM.zoomLabel.textContent = `${Math.round(State.zoom * 100)}%`;
}

function generateNewEventX() {
  return snapX(State.viewportCenterX + randInt(-120, 120));
}


/* ═══════════════════════════════════════════════════════════════
   5. WELCOME SCREEN
═══════════════════════════════════════════════════════════════ */

function initWelcomeScreen() {
  // Render template cards on welcome screen
  const container = DOM.welcomeTemplates;
  container.innerHTML = '';
  TEMPLATES.forEach(tpl => {
    const card = document.createElement('button');
    card.className = 'wtpl-card';
    card.innerHTML = `
      <div class="wtpl-era">${escHtml(tpl.era)}</div>
      <div class="wtpl-name">${escHtml(tpl.name)}</div>
      <div class="wtpl-count">${tpl.events.length} events</div>
    `;
    card.addEventListener('click', () => loadTemplate(tpl));
    container.appendChild(card);
  });

  DOM.welcomeNew.addEventListener('click', () => {
    startBlankTimeline('Untitled Timeline');
  });

  DOM.welcomeImport.addEventListener('click', () => {
    DOM.importFileInput.click();
  });
}

function showWelcomeScreen() {
  DOM.welcomeScreen.style.display = '';
  DOM.welcomeScreen.style.animation = 'fadeIn 250ms ease both';
  DOM.appShell.classList.add('hidden');
  closeCard();
  exitConnectMode();
}

function hideWelcomeScreen() {
  DOM.welcomeScreen.style.animation = 'none';
  DOM.welcomeScreen.style.opacity = '0';
  DOM.welcomeScreen.style.transition = 'opacity 200ms';
  setTimeout(() => {
    DOM.welcomeScreen.style.display = 'none';
    DOM.welcomeScreen.style.opacity = '';
    DOM.welcomeScreen.style.transition = '';
  }, 200);
  DOM.appShell.classList.remove('hidden');
}


/* ═══════════════════════════════════════════════════════════════
   6. APP SHELL — start timelines
═══════════════════════════════════════════════════════════════ */

function clearTimeline() {
  State.events = [];
  State.connections = [];
  State.nextId = 1;
  State.openCardId = null;
  closeCard();
  DOM.nodesLayer.innerHTML = '';
  DOM.connectionsSvg.querySelectorAll('.connection-path').forEach(p => p.remove());
}

function startBlankTimeline(name) {
  clearTimeline();
  DOM.timelineName.textContent = name || 'Untitled Timeline';
  hideWelcomeScreen();
  initCanvas();
  updateNodeCount();
  updateMinimap();
  updateZoomLabel();
  setStatus('Blank timeline ready — double-click canvas or press N to add an event');
}

function loadTemplate(tpl) {
  clearTimeline();
  DOM.timelineName.textContent = tpl.name;
  hideWelcomeScreen();
  initCanvas();

  // Space events evenly starting at x=4400
  const spacing = 280;
  tpl.events.forEach((ev, i) => {
    const id = uid();
    const x = 4400 + i * spacing;
    const obj = {
      id, title: ev.title, desc: ev.desc, date: ev.date,
      x, side: ev.side, stemHeight: ev.stemHeight,
    };
    State.events.push(obj);
    renderNode(obj);
  });

  // Connections use index pairs → resolve to IDs
  const ids = State.events.map(e => e.id);
  tpl.connections.forEach(([fi, ti]) => {
    if (ids[fi] !== undefined && ids[ti] !== undefined) {
      addConnection(ids[fi], ids[ti], false);
    }
  });

  updateNodeCount();
  updateMinimap();
  updateZoomLabel();
  zoomToFit();
  setStatus(`Loaded "${tpl.name}" — ${tpl.events.length} events`);
}

// Home button → welcome screen
DOM.homeBtn.addEventListener('click', showWelcomeScreen);


/* ═══════════════════════════════════════════════════════════════
   7. CANVAS — PAN & ZOOM
═══════════════════════════════════════════════════════════════ */

function initCanvas() {
  const vw = window.innerWidth, vh = window.innerHeight - 78;
  State.panX = vw / 2 - 5000 * State.zoom;
  State.panY = vh / 2 - State.AXIS_Y * State.zoom;
  State.zoom = 1;
  applyTransform();
  drawTicks();
}

function drawTicks() {
  const frag = document.createDocumentFragment();
  const step = 200;
  for (let i = 0; i <= 50; i++) {
    const x = i * step;
    const tick = document.createElement('div');
    tick.className = i % 5 === 0 ? 'tick tick-major' : 'tick';
    tick.style.left = x + 'px';
    frag.appendChild(tick);
  }
  DOM.ticksLayer.innerHTML = '';
  DOM.ticksLayer.appendChild(frag);
}

// Pan
DOM.canvasWrapper.addEventListener('mousedown', e => {
  const targets = [DOM.canvasWrapper, DOM.canvas, DOM.axisLine, DOM.ticksLayer, DOM.connectionsSvg];
  const ok = targets.includes(e.target) || e.target.classList.contains('tick')
            || e.target.classList.contains('tick-major') || e.target === DOM.nodesLayer;
  if (!ok || e.button !== 0) return;
  closeCard(); hideContextMenu();
  State.isPanning = true;
  State.panStartX = State.panX; State.panStartY = State.panY;
  State.panStartMouseX = e.clientX; State.panStartMouseY = e.clientY;
  DOM.canvasWrapper.classList.add('dragging');
});

document.addEventListener('mousemove', e => {
  const c = viewportToCanvas(e.clientX, e.clientY);
  DOM.coordDisplay.textContent = `x: ${Math.round(c.x - 5000)}`;

  if (State.isPanning) {
    State.panX = State.panStartX + (e.clientX - State.panStartMouseX);
    State.panY = State.panStartY + (e.clientY - State.panStartMouseY);
    applyTransform(); updateMinimap(); return;
  }
  if (State.draggingNode) onNodeDragMove(e);
});

document.addEventListener('mouseup', e => {
  if (State.isPanning) { State.isPanning = false; DOM.canvasWrapper.classList.remove('dragging'); }
  if (State.draggingNode) onNodeDragEnd(e);
});

// Zoom
DOM.canvasWrapper.addEventListener('wheel', e => {
  e.preventDefault();
  zoomAtPoint(e.clientX, e.clientY, e.deltaY < 0 ? 1.08 : 0.93);
}, { passive: false });

function zoomAtPoint(vx, vy, factor) {
  const oldZoom = State.zoom;
  const newZoom = clamp(State.zoom * factor, 0.12, 3);
  State.panX = vx - (vx - State.panX) * (newZoom / oldZoom);
  State.panY = vy - (vy - State.panY) * (newZoom / oldZoom);
  State.zoom = newZoom;
  applyTransform(); updateZoomLabel(); updateMinimap(); updateConnections();
}

DOM.zoomIn.addEventListener('click', () => zoomAtPoint(window.innerWidth/2, (window.innerHeight-78)/2, 1.2));
DOM.zoomOut.addEventListener('click', () => zoomAtPoint(window.innerWidth/2, (window.innerHeight-78)/2, 1/1.2));

function zoomToFit() {
  if (!State.events.length) { initCanvas(); return; }
  const xs = State.events.map(e => e.x);
  const minX = Math.min(...xs) - 250, maxX = Math.max(...xs) + 250;
  const vw = window.innerWidth, vh = window.innerHeight - 78;
  State.zoom = clamp(vw / (maxX - minX), 0.18, 1.8);
  State.panX = vw / 2 - ((minX + maxX) / 2) * State.zoom;
  State.panY = vh / 2 - State.AXIS_Y * State.zoom;
  applyTransform(); updateZoomLabel(); updateMinimap();
}

function panToX(x, animated = true) {
  const vw = window.innerWidth, vh = window.innerHeight - 78;
  const targetX = vw / 2 - x * State.zoom;
  const targetY = vh / 2 - State.AXIS_Y * State.zoom;
  if (!animated) { State.panX = targetX; State.panY = targetY; applyTransform(); updateMinimap(); return; }
  const sx = State.panX, sy = State.panY, t0 = performance.now(), dur = 380;
  const step = now => {
    const t = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - t, 3);
    State.panX = lerp(sx, targetX, e);
    State.panY = lerp(sy, targetY, e);
    applyTransform(); updateMinimap();
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Click on blank canvas — close things
DOM.canvasWrapper.addEventListener('click', e => {
  const bg = [DOM.canvasWrapper, DOM.canvas, DOM.connectionsSvg];
  if (bg.includes(e.target) || e.target === DOM.nodesLayer) {
    closeCard(); if (State.connectMode) exitConnectMode(); hideContextMenu();
  }
});

// Double-click to add event at that position
let _dblX = null;
DOM.canvasWrapper.addEventListener('dblclick', e => {
  const bg = [DOM.canvasWrapper, DOM.canvas, DOM.nodesLayer];
  if (!bg.includes(e.target) && !e.target.classList.contains('tick')) return;
  _dblX = snapX(viewportToCanvas(e.clientX, e.clientY).x);
  openCreateModal();
});


/* ═══════════════════════════════════════════════════════════════
   8. EVENTS — CREATE / EDIT / DELETE
═══════════════════════════════════════════════════════════════ */

let _modalMode = 'create';

DOM.addEventBtn.addEventListener('click', openCreateModal);

function openCreateModal() {
  _modalMode = 'create'; State.editingId = null;
  DOM.modalTitle.textContent = 'New Event';
  DOM.eventTitle.value = ''; DOM.eventDesc.value = ''; DOM.eventDate.value = '';
  DOM.modalOverlay.classList.remove('hidden');
  setTimeout(() => DOM.eventTitle.focus(), 80);
}

function openEditModal(id) {
  const ev = findEvent(id); if (!ev) return;
  _modalMode = 'edit'; State.editingId = id;
  DOM.modalTitle.textContent = 'Edit Event';
  DOM.eventTitle.value = ev.title; DOM.eventDesc.value = ev.desc; DOM.eventDate.value = ev.date;
  DOM.modalOverlay.classList.remove('hidden');
  setTimeout(() => DOM.eventTitle.focus(), 80);
}

DOM.modalClose.addEventListener('click', () => DOM.modalOverlay.classList.add('hidden'));
DOM.modalCancel.addEventListener('click', () => DOM.modalOverlay.classList.add('hidden'));
DOM.modalOverlay.addEventListener('click', e => { if (e.target === DOM.modalOverlay) DOM.modalOverlay.classList.add('hidden'); });
DOM.modal.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveModal();
  if (e.key === 'Escape') DOM.modalOverlay.classList.add('hidden');
});
DOM.modalSave.addEventListener('click', saveModal);

function saveModal() {
  const title = DOM.eventTitle.value.trim();
  if (!title) {
    DOM.eventTitle.classList.add('field-error');
    setTimeout(() => DOM.eventTitle.classList.remove('field-error'), 900);
    return;
  }
  const desc = DOM.eventDesc.value.trim(), date = DOM.eventDate.value.trim();
  if (_modalMode === 'create') createEvent(title, desc, date);
  else updateEvent(State.editingId, title, desc, date);
  DOM.modalOverlay.classList.add('hidden');
}

function createEvent(title, desc, date) {
  const id = uid();
  const x = _dblX !== null ? _dblX : generateNewEventX();
  _dblX = null;
  const side = State.events.length % 2 === 0 ? 'above' : 'below';
  const stemHeight = randInt(State.STEM_MIN, State.STEM_MAX);
  const ev = { id, title, desc, date, x, side, stemHeight };
  State.events.push(ev);
  renderNode(ev);
  updateNodeCount(); updateMinimap();
  setStatus(`Event "${title}" created — drag to reposition`);
  panToX(x);
}

function updateEvent(id, title, desc, date) {
  const ev = findEvent(id); if (!ev) return;
  ev.title = title; ev.desc = desc; ev.date = date;
  refreshNodeLabels(ev);
  if (State.openCardId === id) { closeCard(); openCard(id); }
  setStatus(`"${title}" updated`);
}

function deleteEvent(id) {
  State.connections = State.connections.filter(c => c.fromId !== id && c.toId !== id);
  State.events = State.events.filter(e => e.id !== id);
  document.querySelector(`.event-node[data-id="${id}"]`)?.remove();
  closeCard(); updateConnections(); updateNodeCount(); updateMinimap();
  setStatus('Event deleted');
}


/* ═══════════════════════════════════════════════════════════════
   9. NODE RENDERING
═══════════════════════════════════════════════════════════════ */

function nodePositionCSS(ev) {
  const isAbove = ev.side === 'above';
  const stemH = ev.stemHeight;
  // For above nodes: element top is at (AXIS_Y - stemH - 30), height = stemH+30
  // For below nodes: element top is at AXIS_Y, height = stemH+30
  const top  = isAbove ? (State.AXIS_Y - stemH - 30) : State.AXIS_Y;
  const height = stemH + 30;
  return { top, height };
}

function renderNode(ev) {
  const isAbove = ev.side === 'above';
  const stemH   = ev.stemHeight;
  const pos     = nodePositionCSS(ev);
  const labelOffset = stemH + 38;
  const dateOffset  = stemH + 22;

  const el = document.createElement('div');
  el.className = `event-node ${ev.side}`;
  el.dataset.id = String(ev.id);
  el.style.left   = ev.x + 'px';
  el.style.top    = pos.top + 'px';
  el.style.height = pos.height + 'px';

  el.innerHTML = `
    <div class="node-stem"
         style="${isAbove
           ? `height:${stemH}px; bottom:20px;`
           : `height:${stemH}px; top:20px;`}"></div>
    <div class="node-dot-wrap"
         style="${isAbove ? 'bottom:15px;' : 'top:15px;'}">
      <div class="node-dot"></div>
    </div>
    <div class="node-label"
         style="${isAbove
           ? `bottom:${labelOffset}px;`
           : `top:${labelOffset}px;`}"
    >${escHtml(ev.title)}</div>
    ${ev.date ? `<div class="node-date"
         style="${isAbove ? `bottom:${dateOffset}px;` : `top:${dateOffset}px;`}"
    >${escHtml(ev.date)}</div>` : ''}
  `;

  el.addEventListener('click',       e => { e.stopPropagation(); onNodeClick(ev.id); });
  el.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); showContextMenu(ev.id, e.clientX, e.clientY); });
  el.addEventListener('mousedown',   e => { e.stopPropagation(); onNodeMouseDown(ev.id, e); });

  DOM.nodesLayer.appendChild(el);
}

function refreshNodeLabels(ev) {
  const el = document.querySelector(`.event-node[data-id="${ev.id}"]`);
  if (!el) return;
  const labelEl = el.querySelector('.node-label');
  const dateEl  = el.querySelector('.node-date');
  if (labelEl) labelEl.textContent = ev.title;
  if (dateEl)  dateEl.textContent  = ev.date;
  if (!dateEl && ev.date) {
    // Re-render fully if date was added
    el.remove();
    renderNode(ev);
  }
}

function updateNodePosition(ev) {
  const el = document.querySelector(`.event-node[data-id="${ev.id}"]`);
  if (el) el.style.left = ev.x + 'px';
}


/* ═══════════════════════════════════════════════════════════════
   10. NODE INTERACTION — CLICK & CARD
═══════════════════════════════════════════════════════════════ */

function onNodeClick(id) {
  if (State.dragHasMoved) return;
  if (State.connectMode) {
    if (id !== State.connectFromId) addConnection(State.connectFromId, id, true);
    exitConnectMode(); return;
  }
  if (State.openCardId === id) { closeCard(); return; }
  closeCard(); openCard(id);
}

function openCard(id) {
  const ev = findEvent(id); if (!ev) return;
  State.openCardId = id;
  const el = document.querySelector(`.event-node[data-id="${id}"]`);
  el?.classList.add('selected');

  // Get screen coords for the dot
  const dotEl = el?.querySelector('.node-dot');
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  if (dotEl) {
    const r = dotEl.getBoundingClientRect();
    cx = r.left + r.width / 2; cy = r.top + r.height / 2;
  }

  const card = document.createElement('div');
  card.className = 'node-card';
  card.id = 'activeCard';
  card.innerHTML = `
    <div class="card-top">
      <div class="card-header">
        <span class="card-title">${escHtml(ev.title)}</span>
        <button class="card-close">✕</button>
      </div>
      ${ev.date ? `<div class="card-date">${escHtml(ev.date)}</div>` : ''}
    </div>
    <div class="card-body">
      <div class="card-desc">${ev.desc ? escHtml(ev.desc) : '<span style="color:var(--text-lo)">No description</span>'}</div>
    </div>
    <div class="card-footer">
      <button class="card-btn" data-a="edit">Edit</button>
      <button class="card-btn" data-a="connect">Connect</button>
      <button class="card-btn card-btn-danger" data-a="delete">Delete</button>
    </div>
  `;

  // Position near dot, keep in viewport
  const W = 300, H = 220;
  let left = cx + 18, top = cy - 70;
  if (left + W > window.innerWidth - 16) left = cx - W - 18;
  top = clamp(top, 60, window.innerHeight - H - 32);

  card.style.left = left + 'px';
  card.style.top  = top  + 'px';

  card.querySelector('.card-close').addEventListener('click', closeCard);
  card.querySelectorAll('[data-a]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.a;
      closeCard();
      if (a === 'edit')    openEditModal(id);
      if (a === 'connect') enterConnectMode(id);
      if (a === 'delete')  deleteEvent(id);
    });
  });
  card.addEventListener('click', e => e.stopPropagation());
  document.body.appendChild(card);
}

function closeCard() {
  document.getElementById('activeCard')?.remove();
  document.querySelectorAll('.event-node.selected').forEach(e => e.classList.remove('selected'));
  State.openCardId = null;
}


/* ═══════════════════════════════════════════════════════════════
   11. NODE DRAG & DROP
═══════════════════════════════════════════════════════════════ */

function onNodeMouseDown(id, e) {
  if (e.button !== 0) return;
  State.dragHasMoved = false;
  const ev = findEvent(id); if (!ev) return;
  State.draggingNode = { id, startX: ev.x, startMouseX: e.clientX };
}

function onNodeDragMove(e) {
  const { id, startX, startMouseX } = State.draggingNode;
  const dx = (e.clientX - startMouseX) / State.zoom;
  if (Math.abs(dx) > 4) State.dragHasMoved = true;
  if (!State.dragHasMoved) return;

  const ev = findEvent(id); if (!ev) return;
  ev.x = snapX(startX + dx);
  updateNodePosition(ev);
  updateConnections();
  updateMinimap();

  const el = document.querySelector(`.event-node[data-id="${id}"]`);
  el?.classList.add('dragging-node');
  closeCard();
}

function onNodeDragEnd() {
  if (!State.draggingNode) return;
  const { id } = State.draggingNode;
  document.querySelector(`.event-node[data-id="${id}"]`)?.classList.remove('dragging-node');
  State.draggingNode = null;
  updateConnections();
  if (State.dragHasMoved) setStatus('Event repositioned');
}


/* ═══════════════════════════════════════════════════════════════
   12. CONNECTIONS
═══════════════════════════════════════════════════════════════ */

function addConnection(fromId, toId, animated = true) {
  const dup = State.connections.find(
    c => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId)
  );
  if (dup) return;
  State.connections.push({ fromId, toId });
  drawConnection(fromId, toId, animated);
  updateMinimap();
  if (animated) setStatus('Connection created');
}

function updateConnections() {
  DOM.connectionsSvg.querySelectorAll('.connection-path').forEach(p => p.remove());
  State.connections.forEach(c => drawConnection(c.fromId, c.toId, false));
}

function drawConnection(fromId, toId, animated) {
  const from = findEvent(fromId), to = findEvent(toId);
  if (!from || !to) return;

  const fx = from.x, fy = State.AXIS_Y;
  const tx = to.x,   ty = State.AXIS_Y;

  // Curve upward if events are on same side, otherwise straight-ish
  const dx = tx - fx;
  const curve = Math.abs(dx) * 0.35;
  const midY  = fy - 60; // arc above the axis line

  const d = `M ${fx} ${fy} C ${fx + dx*0.3} ${midY}, ${tx - dx*0.3} ${midY}, ${tx} ${ty}`;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.classList.add('connection-path');
  if (animated) path.classList.add('animated');
  path.setAttribute('d', d);
  path.dataset.from = fromId; path.dataset.to = toId;
  path.style.pointerEvents = 'stroke';

  path.addEventListener('contextmenu', e => {
    e.preventDefault();
    showConnContextMenu(fromId, toId, e.clientX, e.clientY);
  });

  DOM.connectionsSvg.appendChild(path);
}

function showConnContextMenu(fromId, toId, cx, cy) {
  const m = document.createElement('div');
  Object.assign(m.style, {
    position:'fixed', left:cx+'px', top:cy+'px', zIndex:1000,
    background:'var(--surface-1)', border:'1px solid var(--border-2)',
    borderRadius:'8px', padding:'4px', minWidth:'160px',
    boxShadow:'0 16px 48px rgba(0,0,0,.85)'
  });
  const btn = document.createElement('button');
  btn.className = 'ctx-item ctx-danger';
  btn.textContent = 'Remove connection';
  btn.addEventListener('click', () => {
    State.connections = State.connections.filter(
      c => !((c.fromId===fromId&&c.toId===toId)||(c.fromId===toId&&c.toId===fromId))
    );
    updateConnections(); m.remove(); setStatus('Connection removed');
  });
  m.appendChild(btn);
  document.body.appendChild(m);
  setTimeout(() => document.addEventListener('click', () => m.remove(), { once: true }), 50);
}


/* ═══════════════════════════════════════════════════════════════
   13. CONNECT MODE
═══════════════════════════════════════════════════════════════ */

function enterConnectMode(fromId) {
  State.connectMode = true; State.connectFromId = fromId;
  DOM.connectTooltip.classList.remove('hidden');
  document.querySelectorAll('.event-node').forEach(el => {
    if (parseInt(el.dataset.id) !== fromId) el.classList.add('connect-target');
  });
  setStatus('Connect mode — click target event');
}

function exitConnectMode() {
  State.connectMode = false; State.connectFromId = null;
  DOM.connectTooltip.classList.add('hidden');
  document.querySelectorAll('.event-node.connect-target')
    .forEach(el => el.classList.remove('connect-target'));
  setStatus('Ready');
}


/* ═══════════════════════════════════════════════════════════════
   14. CONTEXT MENU
═══════════════════════════════════════════════════════════════ */

let _ctxId = null;

function showContextMenu(id, cx, cy) {
  _ctxId = id;
  DOM.contextMenu.style.left = cx + 'px';
  DOM.contextMenu.style.top  = cy + 'px';
  DOM.contextMenu.classList.remove('hidden');
}

function hideContextMenu() { DOM.contextMenu.classList.add('hidden'); _ctxId = null; }

DOM.contextMenu.querySelectorAll('.ctx-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = _ctxId, a = btn.dataset.action;
    hideContextMenu();
    if (a === 'edit')    openEditModal(id);
    if (a === 'connect') enterConnectMode(id);
    if (a === 'delete')  deleteEvent(id);
  });
});

document.addEventListener('click', e => {
  if (!DOM.contextMenu.classList.contains('hidden') && !DOM.contextMenu.contains(e.target))
    hideContextMenu();
});


/* ═══════════════════════════════════════════════════════════════
   15. MINI-MAP
═══════════════════════════════════════════════════════════════ */

const MM = { W: 188, H: 80, RANGE_X: 8000, RANGE_Y: 800, ORIGIN_X: 1000 };
MM.ORIGIN_Y = () => State.AXIS_Y - 400;

function updateMinimap() {
  const vw = window.innerWidth, vh = window.innerHeight - 78;
  const vpL = -State.panX / State.zoom, vpT = -State.panY / State.zoom;
  const vpR = vpL + vw / State.zoom,   vpB = vpT + vh / State.zoom;

  const mx = x => ((x - MM.ORIGIN_X) / MM.RANGE_X) * MM.W;
  const my = y => ((y - MM.ORIGIN_Y()) / MM.RANGE_Y) * MM.H;

  DOM.minimapViewport.style.left   = clamp(mx(vpL), 0, MM.W) + 'px';
  DOM.minimapViewport.style.top    = clamp(my(vpT), 0, MM.H) + 'px';
  DOM.minimapViewport.style.width  = (clamp(mx(vpR), 0, MM.W) - clamp(mx(vpL), 0, MM.W)) + 'px';
  DOM.minimapViewport.style.height = (clamp(my(vpB), 0, MM.H) - clamp(my(vpT), 0, MM.H)) + 'px';

  DOM.minimapNodes.innerHTML = '';
  State.events.forEach(ev => {
    const dot = document.createElement('div');
    dot.className = 'minimap-dot';
    dot.style.left = clamp(mx(ev.x), 0, MM.W) + 'px';
    dot.style.top  = (MM.H / 2) + 'px';
    DOM.minimapNodes.appendChild(dot);
  });
}

DOM.minimapCanvas.addEventListener('click', e => {
  const r = DOM.minimapCanvas.getBoundingClientRect();
  const cx = MM.ORIGIN_X + ((e.clientX - r.left) / MM.W) * MM.RANGE_X;
  const cy = MM.ORIGIN_Y() + ((e.clientY - r.top) / MM.H) * MM.RANGE_Y;
  const vw = window.innerWidth, vh = window.innerHeight - 78;
  State.panX = vw / 2 - cx * State.zoom;
  State.panY = vh / 2 - cy * State.zoom;
  applyTransform(); updateMinimap();
});


/* ═══════════════════════════════════════════════════════════════
   16. STORY MODE
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   16. STORY MODE — Cinematic image-backed storyteller
═══════════════════════════════════════════════════════════════ */

const Story = {
  sorted:        [],
  index:         0,
  direction:     'next',
  transitioning: false,
  imageCache:    {},   // eventId → { url, credit }
  activeLayer:   'A',  // which img layer is currently shown
  prefetchQueue: [],
};

// DOM shortcuts for story elements
const SD = {
  get imgA()      { return document.getElementById('storyImgA'); },
  get imgB()      { return document.getElementById('storyImgB'); },
  get loading()   { return document.getElementById('storyImgLoading'); },
  get credit()    { return document.getElementById('storyImgCredit'); },
};

/* ── Wikipedia image search ────────────────────────────────── */

// Per-event curated Wikipedia search terms for historical templates
// Falls back to building a query from title + date
const IMAGE_QUERIES = {
  // WW1
  'Assassination of Archduke Franz Ferdinand': 'Assassination Franz Ferdinand Sarajevo 1914',
  'Austria-Hungary Declares War on Serbia':    'Austria Hungary Serbia war 1914 declaration',
  'Germany Declares War on Russia & France':   'World War I mobilization 1914 German soldiers',
  'Britain Enters the War':                    'British Expeditionary Force 1914',
  'First Battle of the Marne':                 'Battle of the Marne 1914 Western Front',
  'Battle of Verdun Begins':                   'Battle of Verdun 1916 trenches',
  'Battle of the Somme':                       'Battle of the Somme 1916 soldiers',
  'USA Enters the War':                        'United States World War I troops 1917',
  'Russian Revolution & Exit':                 'Russian Revolution 1917 Bolshevik',
  'The Hundred Days Offensive':                'Hundred Days Offensive 1918 Allied troops',
  'Armistice — War Ends':                      'Armistice 1918 World War I celebration',
  // WW2
  'Germany Invades Poland':                    'Germany invasion Poland 1939 Wehrmacht',
  'Fall of France':                            'Dunkirk evacuation 1940 France fall',
  'Battle of Britain':                         'Battle of Britain RAF Spitfire 1940',
  'Operation Barbarossa':                      'Operation Barbarossa 1941 Eastern Front',
  'Attack on Pearl Harbor':                    'Pearl Harbor attack 1941 USS Arizona',
  'Battle of Stalingrad':                      'Battle of Stalingrad 1942 ruins',
  'D-Day — Normandy Landings':                 'D-Day Normandy landings 1944 Omaha Beach',
  'Liberation of Paris':                       'Liberation of Paris 1944 celebration',
  'Battle of the Bulge':                       'Battle of the Bulge 1944 Ardennes snow',
  'VE Day — Victory in Europe':                'VE Day 1945 celebration London crowds',
  'Atomic Bombings of Hiroshima & Nagasaki':   'Hiroshima atomic bomb mushroom cloud 1945',
  'VJ Day — Victory over Japan':               'VJ Day 1945 victory celebration Times Square',
  // Cold War
  'Truman Doctrine':                           'Truman 1947 Congress speech Cold War',
  'Berlin Blockade & Airlift':                 'Berlin Airlift 1948 airplane cargo',
  'NATO Founded':                              'NATO 1949 founding treaty signing',
  'Korean War':                                'Korean War 1950 soldiers frontline',
  'Sputnik Launch':                            'Sputnik 1957 satellite Soviet space',
  'Cuban Missile Crisis':                      'Cuban Missile Crisis 1962 Kennedy',
  'Apollo 11 Moon Landing':                    'Apollo 11 Moon landing 1969 Armstrong',
  'Vietnam War Ends':                          'Saigon fall 1975 Vietnam War helicopter',
  'Soviet Invasion of Afghanistan':            'Soviet Afghanistan war 1979 soldiers',
  'Fall of the Berlin Wall':                   'Berlin Wall fall 1989 crowds celebration',
  'Dissolution of the USSR':                   'Soviet Union dissolution 1991 flag',
  // Space Race
  'Sputnik 1 — First Satellite':               'Sputnik satellite 1957 Soviet space',
  'Laika in Space':                            'Laika dog Sputnik 2 space 1957',
  'Explorer 1 — First US Satellite':           'Explorer 1 satellite 1958 NASA launch',
  'Yuri Gagarin — First Human in Space':       'Yuri Gagarin Vostok 1 cosmonaut 1961',
  "Kennedy's Moon Speech":                     'Kennedy Moon speech Congress 1961',
  'John Glenn Orbits Earth':                   'John Glenn Friendship 7 orbit 1962',
  'First Spacewalk — Alexei Leonov':           'Alexei Leonov spacewalk 1965',
  'Apollo 1 Tragedy':                          'Apollo 1 fire tragedy 1967 NASA',
  'Apollo 8 — First to the Moon':              'Apollo 8 Earthrise photograph 1968 Moon orbit',
  'Apollo 11 — Moon Landing':                  'Neil Armstrong Moon footprint Apollo 11 1969',
  'Apollo 13 — Successful Failure':            'Apollo 13 1970 splashdown crew',
  'Last Moon Landing — Apollo 17':             'Apollo 17 Moon rover Cernan 1972',
  // Internet
  'ARPANET First Message':                     'ARPANET 1969 computer network early internet',
  'TCP/IP Protocol':                           'TCP IP protocol internet 1974 Cerf Kahn',
  'World Wide Web Invented':                   'Tim Berners-Lee World Wide Web CERN 1989',
  'Mosaic Browser Released':                   'Mosaic web browser 1993 NCSA graphical',
  'Amazon & eBay Founded':                     'Amazon 1994 Jeff Bezos early website',
  'Google Founded':                            'Google 1998 Larry Page Sergey Brin Stanford',
  'Dot-com Bust':                              'Dot-com bubble burst 2000 NASDAQ crash',
  'Wikipedia Launched':                        'Wikipedia 2001 online encyclopedia launch',
  'Facebook Goes Global':                      'Facebook 2006 social network growth',
  'iPhone Launched':                           'Steve Jobs iPhone launch 2007 Apple keynote',
  // Renaissance
  'Black Death Sweeps Europe':                 'Black Death plague medieval Europe 14th century',
  "Gutenberg's Printing Press":                'Gutenberg printing press 1440 movable type',
  'Fall of Constantinople':                    'Fall of Constantinople 1453 Ottoman siege',
  'Columbus Reaches the Americas':             'Christopher Columbus 1492 ship Americas voyage',
  "Da Vinci's Peak Work":                      'Leonardo da Vinci Mona Lisa Last Supper Renaissance',
  "Michelangelo's Sistine Chapel":             'Michelangelo Sistine Chapel ceiling Creation of Adam',
  'Protestant Reformation':                    'Martin Luther 1517 Ninety Five Theses Reformation',
  'Copernican Revolution':                     'Copernicus heliocentric model solar system 1543',
  "Shakespeare's Great Plays":                 'Shakespeare Globe Theatre 1600 Hamlet',
  'Galileo & the Telescope':                   'Galileo telescope 1609 astronomy Jupiter moons',
};

async function fetchWikimediaImage(eventTitle, dateHint) {
  // Build a smart search query
  const query = IMAGE_QUERIES[eventTitle]
    || `${eventTitle} ${dateHint || ''}`.trim();

  const url = `https://en.wikipedia.org/w/api.php?` + new URLSearchParams({
    action:      'query',
    generator:   'search',
    gsrsearch:   query,
    gsrnamespace:'6',        // File namespace only
    gsrlimit:    '8',
    prop:        'imageinfo',
    iiprop:      'url|extmetadata',
    iiurlwidth:  '1600',
    format:      'json',
    origin:      '*',
  });

  const res  = await fetch(url);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {});

  // Filter to real photos (jpg/jpeg/png), skip SVGs, logos, flags, maps
  const skip = /flag|coat|logo|map|portrait|diagram|svg|icon|seal|banner|emblem|template|stub/i;
  const candidates = pages.filter(p => {
    const name = (p.title || '').toLowerCase();
    const mime = (p.imageinfo?.[0]?.mime || '');
    return !skip.test(name) && (mime.includes('jpeg') || mime.includes('png') || mime.includes('jpg'));
  });

  if (!candidates.length) return null;

  // Pick the one with best resolution (widest thumb)
  candidates.sort((a, b) => {
    const wa = a.imageinfo?.[0]?.thumbwidth || 0;
    const wb = b.imageinfo?.[0]?.thumbwidth || 0;
    return wb - wa;
  });

  const best = candidates[0];
  const info = best.imageinfo?.[0];
  if (!info?.thumburl) return null;

  const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g,'') || '';
  const license = info.extmetadata?.LicenseShortName?.value || '';
  const credit  = [artist, license].filter(Boolean).join(' · ') || 'Wikimedia Commons';

  return { url: info.thumburl, credit };
}

/* ── Image layer management ────────────────────────────────── */

function getActiveLayer()   { return Story.activeLayer === 'A' ? SD.imgA : SD.imgB; }
function getInactiveLayer() { return Story.activeLayer === 'A' ? SD.imgB : SD.imgA; }

function crossFadeTo(url, credit) {
  const incoming = getInactiveLayer();
  const outgoing = getActiveLayer();

  // Preload image before showing
  const img = new Image();
  img.onload = () => {
    // Set image on incoming layer
    incoming.style.backgroundImage = `url('${url}')`;
    incoming.style.opacity = '0';
    incoming.style.display = '';

    // Remove Ken Burns from both, restart on incoming
    incoming.className = 'story-img-layer';
    outgoing.className = 'story-img-layer';

    // Force reflow, then fade in
    void incoming.offsetHeight;

    // Pick Ken Burns direction based on index parity
    const kbClass = Story.index % 2 === 0 ? 'kb-zoom' : 'kb-zoom-r';
    incoming.classList.add(kbClass);
    incoming.style.opacity = '1';

    // Fade out old layer
    outgoing.style.opacity = '0';

    // Swap active
    Story.activeLayer = Story.activeLayer === 'A' ? 'B' : 'A';

    // Show credit
    SD.credit.textContent = `© ${credit}`;

    // Hide shimmer
    SD.loading.classList.remove('active');
  };

  img.onerror = () => {
    // No image found — just clear to dark bg
    SD.loading.classList.remove('active');
    clearImageLayers();
  };

  img.src = url;
}

function clearImageLayers() {
  SD.imgA.style.opacity = '0';
  SD.imgB.style.opacity = '0';
  SD.imgA.style.backgroundImage = '';
  SD.imgB.style.backgroundImage = '';
  SD.credit.textContent = '';
}

/* ── Prefetch next/prev images ─────────────────────────────── */

async function prefetchAdjacentImages() {
  const indices = [Story.index + 1, Story.index - 1].filter(
    i => i >= 0 && i < Story.sorted.length
  );
  for (const idx of indices) {
    const ev = Story.sorted[idx];
    if (!ev || Story.imageCache[ev.id]) continue;
    try {
      const result = await fetchWikimediaImage(ev.title, ev.date);
      if (result) Story.imageCache[ev.id] = result;
    } catch {}
  }
}

/* ── Load image for current slide ─────────────────────────── */

async function loadSlideImage(ev) {
  // Already cached?
  if (Story.imageCache[ev.id]) {
    crossFadeTo(Story.imageCache[ev.id].url, Story.imageCache[ev.id].credit);
    prefetchAdjacentImages();
    return;
  }

  // Show shimmer while loading
  SD.loading.classList.add('active');
  SD.credit.textContent = '';

  try {
    const result = await fetchWikimediaImage(ev.title, ev.date);
    if (result) {
      Story.imageCache[ev.id] = result;
      crossFadeTo(result.url, result.credit);
    } else {
      SD.loading.classList.remove('active');
      clearImageLayers();
    }
  } catch (err) {
    SD.loading.classList.remove('active');
    clearImageLayers();
  }

  prefetchAdjacentImages();
}

/* ── Core story functions ──────────────────────────────────── */

DOM.storyModeBtn.addEventListener('click', enterStoryMode);

function enterStoryMode() {
  if (!State.events.length) {
    setStatus('Add events first to use Story Mode');
    return;
  }

  Story.sorted        = [...State.events].sort((a, b) => a.x - b.x);
  Story.index         = 0;
  Story.transitioning = false;
  Story.activeLayer   = 'A';

  // Reset image layers
  SD.imgA.style.opacity = '0'; SD.imgA.className = 'story-img-layer';
  SD.imgB.style.opacity = '0'; SD.imgB.className = 'story-img-layer';

  DOM.storyTimelineName.textContent = DOM.timelineName.textContent.trim();

  buildChapterDots();
  DOM.storyOverlay.classList.remove('hidden');
  renderStorySlide(false);
}

function exitStoryMode() {
  DOM.storyOverlay.classList.add('hidden');
  // Let images settle, then clear
  setTimeout(clearImageLayers, 600);
}

function buildChapterDots() {
  DOM.storyChapters.innerHTML = '';
  Story.sorted.forEach((ev, i) => {
    const dot = document.createElement('button');
    dot.className = 'story-chap';
    dot.title = ev.title;
    dot.addEventListener('click', () => jumpToSlide(i));
    DOM.storyChapters.appendChild(dot);
  });
}

function jumpToSlide(idx) {
  if (Story.transitioning || idx === Story.index) return;
  Story.direction = idx > Story.index ? 'next' : 'prev';
  Story.index = idx;
  renderStorySlide(true);
}

function renderStorySlide(animated) {
  const ev    = Story.sorted[Story.index];
  const total = Story.sorted.length;

  // Progress fill
  DOM.storyProgressFill.style.width = `${((Story.index + 1) / total) * 100}%`;

  // Counter
  DOM.storyIndex.textContent = Story.index + 1;
  DOM.storyTotal.textContent = total;

  // Chapter dots
  DOM.storyChapters.querySelectorAll('.story-chap').forEach((dot, i) => {
    dot.classList.toggle('active',  i === Story.index);
    dot.classList.toggle('visited', i < Story.index);
  });

  // Nav buttons
  DOM.storyPrev.disabled = Story.index === 0;
  DOM.storyNext.disabled = Story.index === total - 1;

  // Load image (async — non-blocking)
  loadSlideImage(ev);

  // Pan background canvas
  panToX(ev.x);

  if (!animated) {
    setSlideContent(ev);
    DOM.storySlide.className = 'story-slide';
    return;
  }

  // Text transition
  Story.transitioning = true;
  const exitCls  = Story.direction === 'next' ? 'exit-left'  : 'exit-right';
  const enterCls = Story.direction === 'next' ? 'enter-right' : 'enter-left';

  DOM.storySlide.classList.add(exitCls);
  setTimeout(() => {
    setSlideContent(ev);
    DOM.storySlide.className = `story-slide ${enterCls}`;
    setTimeout(() => { Story.transitioning = false; }, 480);
  }, 250);
}

function setSlideContent(ev) {
  DOM.slideEyebrow.textContent = ev.date || `Event ${Story.index + 1} of ${Story.sorted.length}`;
  DOM.slideTitle.textContent   = ev.title;
  DOM.slideBody.textContent    = ev.desc || 'No description provided for this event.';
}

// Nav buttons
DOM.storyNext.addEventListener('click', () => {
  if (Story.transitioning) return;
  if (Story.index < Story.sorted.length - 1) {
    Story.direction = 'next'; Story.index++;
    renderStorySlide(true);
  }
});

DOM.storyPrev.addEventListener('click', () => {
  if (Story.transitioning) return;
  if (Story.index > 0) {
    Story.direction = 'prev'; Story.index--;
    renderStorySlide(true);
  }
});

DOM.storyExit.addEventListener('click', exitStoryMode);

// Keyboard
document.addEventListener('keydown', e => {
  if (DOM.storyOverlay.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') DOM.storyNext.click();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   DOM.storyPrev.click();
  if (e.key === 'Escape') exitStoryMode();
});


/* ═══════════════════════════════════════════════════════════════
   17. TEMPLATES PANEL (in-app)
═══════════════════════════════════════════════════════════════ */

function initTemplatesPanel() {
  DOM.templatesPanelBody.innerHTML = '';
  TEMPLATES.forEach(tpl => {
    const item = document.createElement('button');
    item.className = 'tpl-item';
    item.innerHTML = `
      <div class="tpl-era">${escHtml(tpl.era)}</div>
      <div class="tpl-name">${escHtml(tpl.name)}</div>
      <div class="tpl-preview">${escHtml(tpl.preview)}</div>
      <div class="tpl-meta">${tpl.events.length} events</div>
    `;
    item.addEventListener('click', () => {
      closeTemplatesPanel();
      if (State.events.length > 0) {
        // Confirm before overwriting
        _pendingTemplate = tpl;
        openNewTimelineModal(tpl.name);
      } else {
        loadTemplate(tpl);
      }
    });
    DOM.templatesPanelBody.appendChild(item);
  });
}

function openTemplatesPanel() {
  DOM.templatesPanel.classList.remove('hidden');
  DOM.panelBackdrop.classList.remove('hidden');
}

function closeTemplatesPanel() {
  DOM.templatesPanel.classList.add('hidden');
  DOM.panelBackdrop.classList.add('hidden');
}

DOM.templatesBtn.addEventListener('click', openTemplatesPanel);
DOM.templatesPanelClose.addEventListener('click', closeTemplatesPanel);
DOM.panelBackdrop.addEventListener('click', closeTemplatesPanel);


/* ═══════════════════════════════════════════════════════════════
   18. NEW TIMELINE FLOW
═══════════════════════════════════════════════════════════════ */

let _pendingTemplate = null;

DOM.newTimelineBtn.addEventListener('click', () => {
  _pendingTemplate = null;
  openNewTimelineModal('');
});

function openNewTimelineModal(name) {
  DOM.newTlName.value = name || '';
  DOM.newTimelineOverlay.classList.remove('hidden');
  setTimeout(() => DOM.newTlName.focus(), 80);
}

DOM.newTlClose.addEventListener('click',   () => DOM.newTimelineOverlay.classList.add('hidden'));
DOM.newTlCancel.addEventListener('click',  () => DOM.newTimelineOverlay.classList.add('hidden'));
DOM.newTimelineOverlay.addEventListener('click', e => {
  if (e.target === DOM.newTimelineOverlay) DOM.newTimelineOverlay.classList.add('hidden');
});

DOM.newTlConfirm.addEventListener('click', () => {
  DOM.newTimelineOverlay.classList.add('hidden');
  if (_pendingTemplate) {
    loadTemplate(_pendingTemplate);
    _pendingTemplate = null;
  } else {
    startBlankTimeline(DOM.newTlName.value.trim() || 'Untitled Timeline');
  }
});


/* ═══════════════════════════════════════════════════════════════
   19. EXPORT / IMPORT
═══════════════════════════════════════════════════════════════ */

DOM.exportBtn.addEventListener('click', () => {
  const data = {
    version: 2,
    name: DOM.timelineName.textContent.trim(),
    events: State.events,
    connections: State.connections,
    nextId: State.nextId,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'chrono-timeline.json'; a.click();
  URL.revokeObjectURL(url);
  setStatus('Timeline exported');
});

DOM.importFileInput.addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try { importJSON(JSON.parse(ev.target.result)); }
    catch { setStatus('Import failed — invalid JSON'); }
    DOM.importFileInput.value = '';
  };
  reader.readAsText(file);
});

function importJSON(data) {
  if (!data.events) { setStatus('Import failed — no events found'); return; }
  clearTimeline();
  State.nextId = data.nextId || 1;
  if (data.name) DOM.timelineName.textContent = data.name;
  data.events.forEach(ev => { State.events.push(ev); renderNode(ev); });
  if (data.connections) { State.connections = data.connections; updateConnections(); }
  hideWelcomeScreen();
  initCanvas();
  updateNodeCount(); updateMinimap();
  zoomToFit();
  setStatus(`Imported "${data.name || 'Timeline'}" — ${State.events.length} events`);
}

// Welcome import button wires to same file input
DOM.welcomeImport.addEventListener('click', () => DOM.importFileInput.click());


/* ═══════════════════════════════════════════════════════════════
   20. KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', e => {
  const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)
                  || document.activeElement.isContentEditable;

  if (e.key === 'Escape') {
    if (!DOM.modalOverlay.classList.contains('hidden'))       { DOM.modalOverlay.classList.add('hidden'); return; }
    if (!DOM.newTimelineOverlay.classList.contains('hidden')) { DOM.newTimelineOverlay.classList.add('hidden'); return; }
    if (!DOM.storyOverlay.classList.contains('hidden'))       { exitStoryMode(); return; }
    if (!DOM.templatesPanel.classList.contains('hidden'))     { closeTemplatesPanel(); return; }
    if (State.connectMode)                                    { exitConnectMode(); return; }
    closeCard();
  }

  if (inInput) return;

  if (e.key === 'n' || e.key === 'N') openCreateModal();
  if (e.key === 'f' || e.key === 'F') zoomToFit();
  if (e.key === '+' || e.key === '=') zoomAtPoint(window.innerWidth/2, (window.innerHeight-78)/2, 1.15);
  if (e.key === '-') zoomAtPoint(window.innerWidth/2, (window.innerHeight-78)/2, 1/1.15);
  if ((e.key === 'Delete' || e.key === 'Backspace') && State.openCardId) deleteEvent(State.openCardId);
});

window.addEventListener('resize', () => { updateMinimap(); updateConnections(); });


/* ═══════════════════════════════════════════════════════════════
   21. INIT
═══════════════════════════════════════════════════════════════ */

function init() {
  initWelcomeScreen();
  initTemplatesPanel();
  // Start on welcome screen — no auto-loaded sample data
  // (user chooses New, Import, or a Historical template)
}

init();