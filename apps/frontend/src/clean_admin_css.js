import fs from 'fs';
import postcss from 'postcss';

const filePath = 'd:/project/salahuddin library/apps/frontend/src/App.css';
const css = fs.readFileSync(filePath, 'utf8');

const plugin = postcss.plugin('clean-admin', () => {
  return (root) => {
    root.walkRules((rule) => {
      // Classes we want to remove from App.css
      const targetClasses = [
        'admin-layout', 'admin-sidebar', 'admin-main-content', 'admin-header',
        'admin-stats-grid', 'admin-quick-actions', 'admin-actions',
        'admin-form-card', 'admin-form', 'admin-table', 'admin-book-overlay',
        'sidebar-overlay', 'sidebar-header', 'sidebar-brand', 'sidebar-menu',
        'sidebar-link', 'sidebar-footer', 'stat-card', 'stat-icon-wrapper',
        'stat-info', 'quick-actions-title', 'user-cell', 'user-avatar-tiny',
        'tags-management-container'
      ];
      
      const selectors = rule.selector.split(',').map(s => s.trim());
      const filtered = selectors.filter(sel => {
        return !targetClasses.some(cls => sel.includes('.' + cls));
      });
      
      if (filtered.length === 0) {
        rule.remove();
      } else if (filtered.length < selectors.length) {
        rule.selector = filtered.join(', ');
      }
    });
    
    // Also remove empty media queries
    root.walkAtRules('media', (atRule) => {
      if (atRule.nodes.length === 0) {
        atRule.remove();
      }
    });

    // Also remove any comment blocks containing "Admin"
    root.walkComments((comment) => {
        if (comment.text.toLowerCase().includes('admin') || comment.text.toLowerCase().includes('sidebar')) {
            comment.remove();
        }
    });
  };
});

postcss([plugin]).process(css, { from: filePath, to: filePath }).then(result => {
  fs.writeFileSync(filePath, result.css);
  console.log('Admin CSS removed from App.css');
});
