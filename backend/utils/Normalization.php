<?php
/**
 * Data Normalization Helpers
 */

class Normalization {
    /**
     * Convert string to Title Case (Every word capitalized)
     * Ideal for Names (First Name, Last Name, City, County)
     */
    public static function toTitleCase($string) {
        if (!$string || !is_string($string)) return $string;
        $string = trim($string);
        if (empty($string)) return $string;
        
        // Remove multiple spaces and convert to lowercase
        $string = preg_replace('/\s+/', ' ', strtolower($string));
        
        // Capitalize each word
        return ucwords($string);
    }

    /**
     * Convert string to Sentence Case (Only first letter of string capitalized)
     * Ideal for Designations, Occupations, Organizations
     */
    public static function toSentenceCase($string) {
        if (!$string || !is_string($string)) return $string;
        $string = trim($string);
        if (empty($string)) return $string;
        
        // Remove multiple spaces and convert to lowercase
        $string = preg_replace('/\s+/', ' ', strtolower($string));
        
        // Capitalize first letter
        return ucfirst($string);
    }

    /**
     * Normalize member data array
     */
    public static function normalizeMemberData(&$data) {
        // Title Case Fields
        $titleFields = ['first_name', 'last_name', 'city', 'state', 'county', 'sub_county', 'chapter'];
        foreach ($titleFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = self::toTitleCase($data[$field]);
            }
        }

        // Sentence Case Fields
        $sentenceFields = ['occupation', 'organization', 'designation', 'work_station', 'cadre', 'employment_status'];
        foreach ($sentenceFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = self::toSentenceCase($data[$field]);
            }
        }
    }
}
