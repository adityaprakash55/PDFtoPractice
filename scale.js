const fs = require('fs');
let ejs = fs.readFileSync('views/index.ejs', 'utf8');

// Scale widths
ejs = ejs.replace(/max-w-4xl/g, 'max-w-6xl');
ejs = ejs.replace(/w-56/g, 'w-72');

// Only scale texts inside liveResultsDashboard
const start = ejs.indexOf('id="liveResultsDashboard"');
const end = ejs.indexOf('</aside>', start); // well, I need to replace text up to the end of the dashboard

if (start !== -1) {
    let dash = ejs.substring(start);
    dash = dash.replace(/text-\[10px\]/g, 'text-xs');
    // We want to shift xs->sm, sm->base, base->lg, lg->xl, xl->2xl, 2xl->3xl, 3xl->4xl, 4xl->5xl, 5xl->6xl
    // Do it safely
    dash = dash.replace(/text-xs/g, '__TEXT_SM__');
    dash = dash.replace(/text-sm/g, '__TEXT_BASE__');
    dash = dash.replace(/text-base/g, '__TEXT_LG__');
    dash = dash.replace(/text-lg/g, '__TEXT_XL__');
    dash = dash.replace(/text-xl/g, '__TEXT_2XL__');
    dash = dash.replace(/text-2xl/g, '__TEXT_3XL__');
    dash = dash.replace(/text-3xl/g, '__TEXT_4XL__');
    dash = dash.replace(/text-4xl/g, '__TEXT_5XL__');
    dash = dash.replace(/text-5xl/g, '__TEXT_6XL__');

    dash = dash.replace(/__TEXT_SM__/g, 'text-sm');
    dash = dash.replace(/__TEXT_BASE__/g, 'text-base');
    dash = dash.replace(/__TEXT_LG__/g, 'text-lg');
    dash = dash.replace(/__TEXT_XL__/g, 'text-xl');
    dash = dash.replace(/__TEXT_2XL__/g, 'text-2xl');
    dash = dash.replace(/__TEXT_3XL__/g, 'text-3xl');
    dash = dash.replace(/__TEXT_4XL__/g, 'text-4xl');
    dash = dash.replace(/__TEXT_5XL__/g, 'text-5xl');
    dash = dash.replace(/__TEXT_6XL__/g, 'text-6xl');

    ejs = ejs.substring(0, start) + dash;
}

fs.writeFileSync('views/index.ejs', ejs);
console.log('Scaled text sizes');
