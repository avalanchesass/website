const fs = require(`fs`);
const Handlebars = require(`handlebars`);
const htmlclean = require(`htmlclean`);
const marked = require(`marked`);
const mkdir = require(`mkdirp`);
const path = require(`path`);

const layoutHbs = path.join(process.cwd(), `views`, `layout.hbs`);
Handlebars.registerPartial(`layout`, fs.readFileSync(layoutHbs, `utf8`));

const packageHbs = path.join(process.cwd(), `views`, `package.hbs`);
const packageTemplate = fs.readFileSync(packageHbs, `utf8`);

module.exports = (packageName, data) => {
  const distHtmlPath = path.join(process.cwd(), `dist`, `packages`, packageName);
  const packagePath = path.join(process.cwd(), `avalanche`, `packages`, packageName);
  let packageContent = fs.readFileSync(path.join(packagePath, `README.md`), `utf8`);

  // Create live demo code from code example.
  packageContent = marked(packageContent.replace(/```html((.|\n)*?)```/, `$1\`\`\`html$1\`\`\``));

  data.packageContent = packageContent;
  let html = htmlclean(Handlebars.compile(packageTemplate)(data));

  // Fix <pre> indentation.
  const pattern = html.match(/\s*\n[\t\s]*/);
  html = html.replace(new RegExp(pattern, `g`), `\n`);

  try {
    mkdir.sync(distHtmlPath);
  } catch (error) {}
  fs.writeFileSync(path.join(distHtmlPath, `index.html`), html);
};
