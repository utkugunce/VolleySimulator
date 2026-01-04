import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamAvatar from '../../app/components/TeamAvatar';

// Mock next/image
jest.mock('next/image', () => {
    return function MockImage({ src, alt, onError, className }: any) {
        // We cast to any to simplify props, but handle the callback
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                onError={() => {
                    if (onError) onError();
                }}
            />
        );
    };
});

describe('TeamAvatar', () => {
    it('renders image with correct src by default', () => {
        render(<TeamAvatar name="VakıfBank" />);
        const avatar = screen.getByLabelText('VakıfBank');
        expect(avatar).toBeInTheDocument();

        const imageElement = avatar.querySelector('img');
        expect(imageElement).toHaveAttribute('src', '/logos/VakıfBank.png');
        expect(imageElement).toHaveAttribute('alt', 'VakıfBank');
    });

    it('renders initials when image fails to load', () => {
        render(<TeamAvatar name="Eczacıbaşı Dynavit" />);
        const avatar = screen.getByLabelText('Eczacıbaşı Dynavit');
        const imgElement = avatar.querySelector('img')!;

        fireEvent.error(imgElement);

        // ED for Eczacıbaşı Dynavit
        expect(screen.getByText('ED')).toBeInTheDocument();
    });

    it('renders name when showName is true', () => {
        render(<TeamAvatar name="Fenerbahçe" showName={true} />);
        expect(screen.getByText('Fenerbahçe')).toBeInTheDocument();
    });

    it('applies correct size classes', () => {
        const { rerender } = render(<TeamAvatar name="SizeTest" size="xs" />);
        let avatar = screen.getByLabelText('SizeTest');
        expect(avatar).toHaveClass('w-4 h-4');

        rerender(<TeamAvatar name="SizeTest" size="lg" />);
        avatar = screen.getByLabelText('SizeTest');
        expect(avatar).toHaveClass('w-12 h-12');
    });

    it('applies ring for top positions', () => {
        render(<TeamAvatar name="PositionTest" position={1} />);
        const avatar = screen.getByLabelText('PositionTest');
        expect(avatar).toHaveClass('ring-amber-400');
    });

    it('handles single word names correctly for initials', () => {
        render(<TeamAvatar name="Kuzeyboru" />);
        const avatar = screen.getByLabelText('Kuzeyboru');
        const imgElement = avatar.querySelector('img')!;
        fireEvent.error(imgElement);
        expect(screen.getByText('Ku')).toBeInTheDocument();
    });
});
