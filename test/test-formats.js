import { expect } from "chai";
import * as formats from '../src/lib/formats';

describe('formats', function () {

  describe('JSON', function () {
    beforeEach(function () {
      this.format = new formats.JSONFormat();
    });
    it('should import', function () {
      const data = [{title: 'test title'}];
      const content = JSON.stringify(data);
      const result = this.format.importContent(content);
      expect(result).to.deep.equal(data);
    });
    it('should export', function () {
      const data = [{title: 'test title'}];
      const content = '[{"title": "test title"}]';
      const result = this.format.exportOutline(data);
      expect(result).to.equal(content);
    });
  });

  describe('OPML', function () {
    beforeEach(function () {
      this.format =new formats.OPMLFormat();
    });
    it('should import', function () {
    });
    it('should export', function () {
    });
  });

});
