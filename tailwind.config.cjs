module.exports = {
  content: ['./app/src/main/assets/*.{html,js}'],
  darkMode: 'class',
  theme: { extend: {
    boxShadow: {'2xs':'0 1px 2px rgb(0 0 0 / 0.05)', xs:'0 1px 3px rgb(0 0 0 / 0.08)'},
    backdropBlur: {xs:'4px'}
  } },
  plugins: []
};
