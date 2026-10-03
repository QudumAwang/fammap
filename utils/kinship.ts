import { Marriage, Person } from "@/types/family";

export function getKinshipTitle(
  personId: string,
  referenceId: string,
  persons: Person[],
  marriages: Marriage[]
): string {
  if (!personId || !referenceId) return "Kerabat";
  if (personId === referenceId) return "Saya";

  const personMap = new Map<string, Person>(persons.map((p) => [p.id, p]));
  const target = personMap.get(personId);
  const ref = personMap.get(referenceId);

  if (!target || !ref) return "Kerabat";

  const getSpouseIds = (id: string): string[] => {
    return marriages
      .filter((m) => m.husband_id === id || m.wife_id === id)
      .map((m) => (m.husband_id === id ? m.wife_id : m.husband_id));
  };

  const areSiblings = (p1: Person, p2: Person): boolean => {
    if (p1.id === p2.id) return false;
    const sameFather = p1.father_id && p2.father_id && p1.father_id === p2.father_id;
    const sameMother = p1.mother_id && p2.mother_id && p1.mother_id === p2.mother_id;
    return Boolean(sameFather || sameMother);
  };

  if (getSpouseIds(ref.id).includes(target.id)) {
    return target.gender === "male" ? "Suami" : "Istri";
  }

  if (ref.father_id === target.id) return "Ayah";
  if (ref.mother_id === target.id) return "Ibu";

  const father = ref.father_id ? personMap.get(ref.father_id) : undefined;
  const mother = ref.mother_id ? personMap.get(ref.mother_id) : undefined;

  if ([father, mother].some((p) => p && getSpouseIds(p.id).includes(target.id))) {
    return target.gender === "male" ? "Ayah Tiri" : "Ibu Tiri";
  }

  if (father && (father.father_id === target.id || (mother && mother.father_id === target.id))) {
    return "Kakek";
  }
  if (father && (father.mother_id === target.id || (mother && mother.mother_id === target.id))) {
    return "Nenek";
  }
  if (!father && mother) {
    if (mother.father_id === target.id) return "Kakek";
    if (mother.mother_id === target.id) return "Nenek";
  }

  const grandfathers = [father?.father_id, mother?.father_id]
    .filter(Boolean)
    .map((id) => personMap.get(id!))
    .filter(Boolean) as Person[];
  const grandmothers = [father?.mother_id, mother?.mother_id]
    .filter(Boolean)
    .map((id) => personMap.get(id!))
    .filter(Boolean) as Person[];

  const isGreatGrandparent = [...grandfathers, ...grandmothers].some(
    (gp) => gp.father_id === target.id || gp.mother_id === target.id
  );
  if (isGreatGrandparent) return "Buyut";

  if ([...grandfathers, ...grandmothers].some((gp) => getSpouseIds(gp.id).includes(target.id))) {
    return target.gender === "male" ? "Kakek" : "Nenek";
  }
  if ([...grandfathers, ...grandmothers].some((gp) => areSiblings(target, gp))) return "Mbah";

  if (areSiblings(target, ref)) {
    if (target.birth_order < ref.birth_order) {
      return target.gender === "male" ? "Kakak (Mas)" : "Kakak (Mbak)";
    }
    if (target.birth_order > ref.birth_order) {
      return target.gender === "male" ? "Adik Laki-laki" : "Adik Perempuan";
    }
    return target.gender === "male" ? "Saudara Laki-laki" : "Saudara Perempuan";
  }

  const isStepSibling = [father, mother].some(
    (p) => p && getSpouseIds(p.id).some((sid) => target.father_id === sid || target.mother_id === sid)
  );
  if (isStepSibling) return "Saudara Tiri";

  if (target.father_id === ref.id || target.mother_id === ref.id) {
    return target.gender === "male" ? "Anak Laki-laki" : "Anak Perempuan";
  }

  const refChildren = persons.filter(
    (p) => p.father_id === ref.id || p.mother_id === ref.id
  );
  const isGrandchild = refChildren.some(
    (c) => target.father_id === c.id || target.mother_id === c.id
  );
  if (isGrandchild) return "Cucu";

  const getUncleAuntTitle = (sibling: Person, parent: Person): string => {
    const isOlder = sibling.birth_order < parent.birth_order;
    if (isOlder) {
      return sibling.gender === "male" ? "Pakdhe" : "Budhe";
    }
    return sibling.gender === "male" ? "Paklek" : "Bulek";
  };

  if (father && areSiblings(target, father)) {
    return getUncleAuntTitle(target, father);
  }
  if (mother && areSiblings(target, mother)) {
    return getUncleAuntTitle(target, mother);
  }

  const targetSpouses = getSpouseIds(target.id).map((id) => personMap.get(id)).filter(Boolean) as Person[];
  for (const s of targetSpouses) {
    if (father && areSiblings(s, father)) {
      const baseTitle = getUncleAuntTitle(s, father);
      return baseTitle === "Pakdhe" ? "Budhe" : baseTitle === "Budhe" ? "Pakdhe" : baseTitle === "Paklek" ? "Bulek" : "Paklek";
    }
    if (mother && areSiblings(s, mother)) {
      const baseTitle = getUncleAuntTitle(s, mother);
      return baseTitle === "Pakdhe" ? "Budhe" : baseTitle === "Budhe" ? "Pakdhe" : baseTitle === "Paklek" ? "Bulek" : "Paklek";
    }
  }

  const targetFather = target.father_id ? personMap.get(target.father_id) : undefined;
  const targetMother = target.mother_id ? personMap.get(target.mother_id) : undefined;

  const isCousinPaternal = (father && targetFather && areSiblings(targetFather, father)) ||
                           (father && targetMother && areSiblings(targetMother, father));
  const isCousinMaternal = (mother && targetFather && areSiblings(targetFather, mother)) ||
                           (mother && targetMother && areSiblings(targetMother, mother));

  if (isCousinPaternal || isCousinMaternal) {
    return "Sepupu";
  }

  const refSiblings = persons.filter((p) => areSiblings(p, ref));
  const isNephewNiece = refSiblings.some(
    (s) => target.father_id === s.id || target.mother_id === s.id
  );
  if (isNephewNiece) {
    return target.gender === "male" ? "Keponakan Laki-laki" : "Keponakan Perempuan";
  }

  const isSiblingSpouse = refSiblings.some((s) => getSpouseIds(s.id).includes(target.id));
  if (isSiblingSpouse) return "Ipar";

  const isChildSpouse = refChildren.some((c) => getSpouseIds(c.id).includes(target.id));
  if (isChildSpouse) return "Menantu";

  const isGrandchildSpouse = targetSpouses.some((s) =>
    refChildren.some((c) => s.father_id === c.id || s.mother_id === c.id)
  );
  if (isGrandchildSpouse) return "Cucu Menantu";

  const childSpouses = refChildren
    .flatMap((c) => getSpouseIds(c.id))
    .map((id) => personMap.get(id))
    .filter(Boolean) as Person[];
  if (childSpouses.some((s) => s.father_id === target.id || s.mother_id === target.id)) return "Besan";

  const refSpouseIds = getSpouseIds(ref.id);
  for (const spId of refSpouseIds) {
    const sp = personMap.get(spId);
    if (sp) {
      if (sp.father_id === target.id || sp.mother_id === target.id) {
        return "Mertua";
      }
      if (areSiblings(target, sp)) {
        return "Ipar";
      }
    }
  }

  return "Kerabat";
}
