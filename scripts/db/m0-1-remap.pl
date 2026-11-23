#!/usr/bin/env perl
# Przepisuje plik testu pgTAP na dane trwałe: własna przestrzeń UUID i e-maili dla pliku nr N, COMMIT zamiast ROLLBACK.
use strict; use warnings;
my $n = shift @ARGV or die "usage: m0-1-remap.pl NNN < test.sql\n";
local $/; my $s = <STDIN>;
my $keep = qr/^5e000000-0000-4000-8000-000000000001$/i;   # magazyn główny z migracji
$s =~ s{\b([0-9a-f]{8}-[0-9a-f]{4}-)4([0-9a-f]{3})(-[89ab][0-9a-f]{3}-[0-9a-f]{12})\b}{ my $u="$1"."4$2$3"; $u =~ $keep ? $u : "${1}4${n}$3" }gie;
$s =~ s{\b([0-9a-f]{8}-[0-9a-f]{4}-)4([0-9a-f]{3})(-[89ab][0-9a-f]{3}-)(?=')}{${1}4${n}$3}gi;
$s =~ s{@(test\.local|example\.invalid|example\.test)\b}{\@f$n.$1}gi;
$s =~ s{(insert into auth\.users\b.*?)(;\s*\n)}{$1 on conflict do nothing$2}gis;
$s =~ s{^rollback;\s*$}{commit;}m;
print $s;
