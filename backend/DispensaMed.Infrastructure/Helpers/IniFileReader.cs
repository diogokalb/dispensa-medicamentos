namespace DispensaMed.Infrastructure.Helpers;

/// <summary>
/// Parses standard Windows INI files.
/// Supports sections in [brackets], Key=Value pairs, comments (lines starting
/// with ';' or '//'), whitespace trimming, and quoted values.
/// </summary>
public class IniFileReader
{
    private readonly Dictionary<string, Dictionary<string, string>> _sections =
        new(StringComparer.OrdinalIgnoreCase);

    public IniFileReader(string filePath)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException($"INI file not found at path '{filePath}'.", filePath);

        Parse(filePath);
    }

    private void Parse(string filePath)
    {
        var currentSection = string.Empty;
        _sections[currentSection] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var rawLine in File.ReadLines(filePath))
        {
            var line = rawLine.Trim();

            if (string.IsNullOrEmpty(line) || line.StartsWith(';') || line.StartsWith("//"))
                continue;

            if (line.StartsWith('[') && line.EndsWith(']'))
            {
                currentSection = line[1..^1].Trim();
                if (!_sections.ContainsKey(currentSection))
                    _sections[currentSection] = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                continue;
            }

            var separatorIndex = line.IndexOf('=');
            if (separatorIndex < 1)
                continue;

            var key = line[..separatorIndex].Trim();
            var value = line[(separatorIndex + 1)..].Trim();

            // Strip surrounding quotes
            if (value.Length >= 2 &&
                ((value.StartsWith('"') && value.EndsWith('"')) ||
                 (value.StartsWith('\'') && value.EndsWith('\''))))
            {
                value = value[1..^1];
            }

            _sections[currentSection][key] = value;
        }
    }

    /// <summary>Returns the value for the given section and key, or null if not found.</summary>
    public string? GetValue(string section, string key)
    {
        if (_sections.TryGetValue(section, out var keys) && keys.TryGetValue(key, out var value))
            return value;
        return null;
    }

    /// <summary>Returns all key-value pairs in the given section.</summary>
    public IReadOnlyDictionary<string, string> GetSection(string section)
    {
        if (_sections.TryGetValue(section, out var keys))
            return keys;
        return new Dictionary<string, string>();
    }
}
