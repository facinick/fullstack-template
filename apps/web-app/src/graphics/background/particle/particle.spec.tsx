import { render } from '@testing-library/react';

import Particle from './particle';

describe('Particle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Particle />);
    expect(baseElement).toBeTruthy();
  });
});
