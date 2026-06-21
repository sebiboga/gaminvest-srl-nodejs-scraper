import { jest } from '@jest/globals';

describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../index.js');
  });

  describe('transformJobsForSOLR', () => {
    it('should filter locations to only Romanian cities', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['România'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['Bucharest'] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Bulgaria'] },
          { url: 'https://test.com/4', title: 'Job 4', location: ['Cluj-Napoca'] },
          { url: 'https://test.com/5', title: 'Job 5', location: [] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['România']);
      expect(result.jobs[1].location).toEqual(['Bucharest']);
      expect(result.jobs[2].location).toEqual(['România']);
      expect(result.jobs[3].location).toEqual(['Cluj-Napoca']);
      expect(result.jobs[4].location).toEqual(['România']);
    });

    it('should keep company uppercase', () => {
      const payload = {
        source: 'gaminvest.ro',
        company: 'gaminvest srl',
        cif: '21913994',
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', company: 'gaminvest', cif: '21913994' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('GAMINVEST SRL');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'ON-SITE' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' },
          { url: 'https://test.com/4', title: 'Job 4', workmode: 'hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
      expect(result.jobs[3].workmode).toBe('hybrid');
    });

    it('should handle empty jobs array', () => {
      const result = index.transformJobsForSOLR({ jobs: [] });
      expect(result.jobs).toEqual([]);
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://www.gaminvest.ro/job/123',
        title: 'Senior Developer',
        location: 'Bucharest'
      };

      const COMPANY_NAME = 'GAMINVEST SRL';
      const COMPANY_CIF = '21913994';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.location).toEqual([rawJob.location]);
      expect(result.workmode).toBe('on-site');
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should set on-site workmode by default', () => {
      const rawJob = {
        url: 'https://test.com/1',
        title: 'Job 1'
      };

      const result = index.mapToJobModel(rawJob, '21913994');

      expect(result.workmode).toBe('on-site');
    });

    it('should handle missing title', () => {
      const rawJob = { url: 'https://test.com/1' };

      const result = index.mapToJobModel(rawJob, '21913994');

      expect(result.title).toBeUndefined();
      expect(result.url).toBe('https://test.com/1');
    });
  });

  describe('parseJobsPage', () => {
    it('should parse HTML and extract jobs from select options', () => {
      const html = `<select id="post">
        <option value="0">Alege postul</option>
        <option value="1">Broker imobiliar in Oradea</option>
        <option value="2">Consultant vanzari in Cluj-Napoca</option>
      </select>`;

      const result = index.parseJobsPage(html);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Broker imobiliar in Oradea');
      expect(result[0].location).toBe('Oradea');
      expect(result[0].url).toBe('https://www.gaminvest.ro/cariere.html#post-1');
      expect(result[1].title).toBe('Consultant vanzari in Cluj-Napoca');
      expect(result[1].location).toBe('Cluj-Napoca');
      expect(result[1].url).toBe('https://www.gaminvest.ro/cariere.html#post-2');
    });

    it('should skip the placeholder option', () => {
      const html = `<select id="post">
        <option value="0">Alege postul</option>
      </select>`;

      const result = index.parseJobsPage(html);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when select has no options', () => {
      const html = `<select id="post"></select>`;

      const result = index.parseJobsPage(html);
      expect(result).toEqual([]);
    });

    it('should default location to Oradea when no match in title', () => {
      const html = `<select id="post">
        <option value="0">Alege postul</option>
        <option value="1">Manager</option>
      </select>`;

      const result = index.parseJobsPage(html);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Manager');
      expect(result[0].location).toBe('Oradea');
    });
  });
});
