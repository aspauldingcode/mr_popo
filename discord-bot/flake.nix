{
  description = "Discord Bot Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.npm
            sqlite
            python3
            gnumake
            gcc
            gh
          ];

          shellHook = ''
            export CXX=g++
            export CC=gcc
            echo "Discord Bot Dev Environment Loaded!"
            echo "Node version: $(node -v)"
            echo "NPM version: $(npm -v)"
          '';
        };
      }
    );
}
