'use client';

import Link from 'next/link';
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background-secondary border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-primary mb-3">📦 CaseVault</h3>
            <p className="text-text-secondary text-sm">
              Empowering students to solve real-world problems with AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cases" className="text-text-secondary hover:text-primary transition-colors">
                  Problem Bank
                </Link>
              </li>
              <li>
                <Link href="/internships" className="text-text-secondary hover:text-primary transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-text-secondary hover:text-primary transition-colors">
                  Summer Programs
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-text-secondary hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-secondary hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-text-secondary">Twitter</li>
              <li className="text-text-secondary">LinkedIn</li>
              <li className="text-text-secondary">GitHub</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-text-tertiary text-sm">
          <p>&copy; {new Date().getFullYear()} CaseVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
