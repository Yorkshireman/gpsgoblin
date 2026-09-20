import sitemap from './sitemap';

describe('sitemap', () => {
  it('includes both GPX help pages at their canonical URLs', () => {
    expect(sitemap()).toEqual(
      expect.arrayContaining([
        {
          url: 'https://gpsgoblin.com/help/how-to-get-a-gpx-file'
        },
        {
          url: 'https://gpsgoblin.com/help/gpx-file-empty-or-missing-data'
        }
      ])
    );
  });
});
