const fs = require('fs');
const glob = require('glob');
const svg2img = require('svg2img');
const mergeImg = require('merge-img');
const cssGen = require('css-generator');

async function init() {
  const source = './3x2';
  const destination = './pngs';
  const spriteDestination = `./spritesheet`;
  const flagWidth = 36;
  const flagHeight = 24;
  const flagOffset = 0;
  const fileNameMatch = /[ \w-]+?(?=\.)/;

  console.log("Creating folders")

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, {
      recursive: true
    });
  }
  if (!fs.existsSync(spriteDestination)) {
    fs.mkdirSync(spriteDestination, {
      recursive: true
    });
  }

  const svgs = glob.sync(`${source}/*.svg`);
  const pngs = svgs.map(path => path.replace(source, destination).replace('.svg', '.png'));

  console.log("Opened CSS")

  const css = cssGen.create({
    indentation: '  '
  });

  css.addRule('.flag', {
    width: `${flagWidth}px`,
    height: `${flagHeight}px`,
    'background-image': `url('spritesheet.png')`,
    'background-repeat': 'no-repeat'
  });

  let spritePosition = 0;

  console.log("Converting SVGs to PNGs")

  svgs.forEach((svg, idx) => {
    const countryCode = svg.match(fileNameMatch)[0].toLocaleLowerCase();

    css.addRule(`.flag.flag-${countryCode}`, {
      'background-position': `0px -${spritePosition}px`
    });

    spritePosition += flagHeight + flagOffset;
    svg2img(
      svg,
      {width:flagWidth, height: flagHeight},
      function(error, buffer) {
        fs.writeFileSync(pngs[idx], buffer);
      }
    );
  })

  console.log("Building sprite sheet")

  const spriteSheet = await mergeImg(pngs, {offset: flagOffset});
  spriteSheet.write(`${spriteDestination}/spritesheet.png`, () => {

    console.log("Writing CSS to file")
    fs.writeFile(`${spriteDestination}/spritesheet.css`,css.getOutput(), () => {
      console.log("Done!");
    })

  });
}

init();