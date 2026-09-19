[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$asset = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\assets\math-town-mascot.png"))
$temporary = "$asset.optimized.png"
$source = [Drawing.Image]::FromFile($asset)
try {
  $targetWidth = [Math]::Min(768, $source.Width)
  $targetHeight = [int][Math]::Round($source.Height * ($targetWidth / $source.Width))
  $bitmap = [Drawing.Bitmap]::new($targetWidth, $targetHeight, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
    } finally { $graphics.Dispose() }
    $bitmap.Save($temporary, [Drawing.Imaging.ImageFormat]::Png)
  } finally { $bitmap.Dispose() }
} finally { $source.Dispose() }
Move-Item -LiteralPath $temporary -Destination $asset -Force
Write-Host "Optimized math-town-mascot.png to $targetWidth x $targetHeight."
