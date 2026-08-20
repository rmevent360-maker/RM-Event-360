const fs = require('fs');
let content = fs.readFileSync('src/data/catalog.ts', 'utf8');
content = content.replace(
  '"Apportez une touche de prestige et un esprit "Tapis Rouge VIP" dès l\'entrée de vos événements. Potelets de guidage en finition dorée miroir accompagnés de cordons en velours."',
  '\'Apportez une touche de prestige et un esprit "Tapis Rouge VIP" dès l\\\'entrée de vos événements. Potelets de guidage en finition dorée miroir accompagnés de cordons en velours.\''
);
fs.writeFileSync('src/data/catalog.ts', content);
